import { readLottieFile } from '../utils/fileLoader.js'

export class Uploader {
  constructor() {
    this._onFileCb = null
    this._el = null
  }

  onFile(cb) {
    this._onFileCb = cb
  }

  _handleFile(file) {
    readLottieFile(file)
      .then((data) => {
        this._setSuccess(file.name)
        if (this._onFileCb) this._onFileCb(data)
      })
      .catch((err) => {
        this._setError(err.message)
      })
  }

  _setError(msg) {
    const status = this._el.querySelector('.upload-status')
    status.textContent = '✕ ' + msg
    status.style.color = 'var(--error)'
  }

  _setSuccess(name) {
    const status = this._el.querySelector('.upload-status')
    status.textContent = '✓ Loaded: ' + name
    status.style.color = 'var(--success)'
  }

  render() {
    const el = document.createElement('div')
    el.className = 'uploader'
    el.innerHTML = `
      <div class="upload-zone" id="upload-zone">
        <div class="upload-icon">⬆</div>
        <div class="upload-label">Drop your Lottie file here</div>
        <div class="upload-sub">.json or .lottie — or click to browse</div>
        <input type="file" id="file-input" accept=".json,.lottie" style="display:none" />
        <div class="upload-status"></div>
      </div>
    `

    document.head.insertAdjacentHTML('beforeend', `
      <style>
        .uploader { width: 100%; }

        .upload-zone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: var(--surface);
        }

        .upload-zone:hover,
        .upload-zone.dragover {
          border-color: var(--accent);
          background: var(--surface2);
        }

        .upload-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .upload-label {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .upload-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .upload-status {
          font-size: 13px;
          min-height: 20px;
          margin-top: 8px;
          font-weight: 500;
        }
      </style>
    `)

    const zone = el.querySelector('#upload-zone')
    const input = el.querySelector('#file-input')

    // Click to browse
    zone.addEventListener('click', () => input.click())

    // File selected via dialog
    input.addEventListener('change', (e) => {
      if (e.target.files[0]) this._handleFile(e.target.files[0])
    })

    // Drag and drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault()
      zone.classList.add('dragover')
    })

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover')
    })

    zone.addEventListener('drop', (e) => {
      e.preventDefault()
      zone.classList.remove('dragover')
      const file = e.dataTransfer.files[0]
      if (file) this._handleFile(file)
    })

    this._el = el
    return el
  }
}