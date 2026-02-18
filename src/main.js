import './style.css'
import { Uploader } from './components/Uploader.js'
import { PreviewGrid } from './components/PreviewGrid.js'
import { WarningPanel } from './components/WarningPanel.js'

const app = document.getElementById('app')

// Header
const header = document.createElement('header')
header.innerHTML = `
  <div class="header-inner">
    <span class="logo">⬡ Lottie Previewer</span>
    <span class="header-sub">Compare how your animation renders across environments</span>
  </div>
  <button class="theme-toggle" id="theme-toggle" title="Toggle light/dark mode">☀️</button>
`
header.style.cssText = `
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
`
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .header-inner { display: flex; align-items: baseline; gap: 16px; }
    .logo { font-size: 18px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px; }
    .header-sub { font-size: 13px; color: var(--text-muted); }
  </style>
`)
app.appendChild(header)

// Main content
const main = document.createElement('main')
main.style.cssText = `
  flex: 1;
  min-height: 0;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
`
app.appendChild(main)

// Boot uploader
const uploader = new Uploader()
main.appendChild(uploader.render())

// When a file is loaded, boot the warning panel + preview grid
uploader.onFile((animationData) => {
  // Remove any existing panel + grid
  const existingPanel = main.querySelector('.wp-panel-wrapper')
  if (existingPanel) existingPanel.remove()
  const existingGrid = main.querySelector('.preview-grid-wrapper')
  if (existingGrid) existingGrid.remove()

  // Warning panel — sits between uploader and preview grid
  const panel = new WarningPanel(animationData)
  const panelWrapper = document.createElement('div')
  panelWrapper.className = 'wp-panel-wrapper'
  panelWrapper.appendChild(panel.render())
  main.appendChild(panelWrapper)

  // Preview grid
  const grid = new PreviewGrid(animationData)
  const wrapper = document.createElement('div')
  wrapper.className = 'preview-grid-wrapper'
  wrapper.style.cssText = 'flex: 1; min-height: 0; display: flex; flex-direction: column;'
  wrapper.appendChild(grid.render())
  main.appendChild(wrapper)
})
// Theme toggle
const themeBtn = document.getElementById('theme-toggle')
let isLight = false

themeBtn.addEventListener('click', () => {
  isLight = !isLight
  document.body.classList.toggle('light', isLight)
  themeBtn.textContent = isLight ? '🌙' : '☀️'
})