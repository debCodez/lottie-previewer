export class PlayerCard {
    constructor({ label, sublabel, tag, rendererClass, animationData, syncController }) {
      this.label = label
      this.sublabel = sublabel
      this.tag = tag
      this.RendererClass = rendererClass
      this.animationData = animationData
      this.sync = syncController
      this.renderer = null
      this._el = null
    }
  
    mount() {
      const container = this._el.querySelector('.player-canvas')
  
      // Wait one frame so the element is in the DOM and has real dimensions
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect()
        const size = rect.width > 0 ? rect.width : 300
        container.style.width = size + 'px'
        container.style.height = size + 'px'
  
        this.renderer = new this.RendererClass(container, this.animationData)
        this.renderer.mount()
        this.sync.register(this.renderer)
  
        this.renderer.onEnterFrame((frame) => {
          if (this.sync._onFrameCb) this.sync._onFrameCb(frame)
        })
      })
    }
  
    render() {
      const el = document.createElement('div')
      el.className = 'player-card'
      el.innerHTML = `
        <div class="player-card-header">
          <div class="player-card-title-group">
            <span class="player-card-label">${this.label}</span>
            <span class="player-card-sublabel">${this.sublabel}</span>
          </div>
          <span class="player-card-tag">${this.tag}</span>
        </div>
        <div class="player-canvas"></div>
      `
  
      document.head.insertAdjacentHTML('beforeend', `
        <style>
          .player-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
          }
  
          .player-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            background: var(--surface2);
          }
  
          .player-card-title-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
  
          .player-card-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text);
          }
  
          .player-card-sublabel {
            font-size: 11px;
            color: var(--text-muted);
          }
  
          .player-card-tag {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 3px 8px;
            border-radius: 20px;
          }
  
          .player-canvas {
            width: 100%;
            flex: 1;
            min-height: 0;
            background: #111;
          }
  
          .player-canvas svg,
          .player-canvas canvas {
            width: 100% !important;
            height: 100% !important;
          }
        </style>
      `)
  
      this._el = el
      return el
    }
  }
  