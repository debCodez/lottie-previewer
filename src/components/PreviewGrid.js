import { WebSVGRenderer } from '../renderers/WebSVGRenderer.js'
import { WebCanvasRenderer } from '../renderers/WebCanvasRenderer.js'
import { FlutterRenderer } from '../renderers/FlutterRenderer.js'
import { NativeRenderer } from '../renderers/NativeRenderer.js'
import { SyncController } from '../utils/syncController.js'
import { ControlBar } from './ControlBar.js'
import { PlayerCard } from './PlayerCard.js'

const ENVIRONMENTS = [
  {
    label: 'Web — SVG',
    sublabel: 'lottie-web · svg renderer',
    tag: 'Browser',
    rendererClass: WebSVGRenderer,
  },
  {
    label: 'Web — Canvas',
    sublabel: 'lottie-web · canvas renderer',
    tag: 'Browser',
    rendererClass: WebCanvasRenderer,
  },
  {
    label: 'Flutter',
    sublabel: 'Skia / Impeller · canvas',
    tag: 'Mobile',
    rendererClass: FlutterRenderer,
  },
  {
    label: 'iOS / Android',
    sublabel: 'lottie-ios · lottie-android',
    tag: 'Native',
    rendererClass: NativeRenderer,
  },
]

export class PreviewGrid {
  constructor(animationData) {
    this.animationData = animationData
    this.sync = new SyncController()
    this.controlBar = new ControlBar(this.sync)
    this.cards = []
  }

  render() {
    const el = document.createElement('div')
    el.className = 'preview-grid-root'

    el.innerHTML = `
      <div class="preview-grid-controls"></div>
      <div class="preview-grid"></div>
    `

    document.head.insertAdjacentHTML('beforeend', `
      <style>
        .preview-grid-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 700px) {
          .preview-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `)

    // Mount control bar
    const controlsEl = el.querySelector('.preview-grid-controls')
    controlsEl.appendChild(this.controlBar.render())

    // Wire frame updates from sync to control bar
    this.sync._onFrameCb = (frame) => {
      this.controlBar.updateFrame(frame)
    }

    // Mount all 4 player cards
    const gridEl = el.querySelector('.preview-grid')
    ENVIRONMENTS.forEach((env) => {
      const card = new PlayerCard({
        ...env,
        animationData: this.animationData,
        syncController: this.sync,
      })
      const cardEl = card.render()
      gridEl.appendChild(cardEl)
      card.mount()
      this.cards.push(card)
    })

    return el
  }
}