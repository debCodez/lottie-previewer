export class ControlBar {
    constructor(syncController) {
      this.sync = syncController
      this._el = null
      this._scrubber = null
      this._frameLabel = null
      this._isPlaying = false
    }
  
    _togglePlay() {
      if (this._isPlaying) {
        this.sync.pause()
        this._setPlayIcon(false)
      } else {
        this.sync.play()
        this._setPlayIcon(true)
      }
      this._isPlaying = !this._isPlaying
    }
  
    _setPlayIcon(playing) {
      const btn = this._el.querySelector('.ctrl-play')
      btn.textContent = playing ? '⏸' : '▶'
    }
  
    updateFrame(frame) {
      if (!this._scrubber) return
      const total = this.sync.getTotalFrames()
      this._scrubber.max = Math.floor(total)
      this._scrubber.value = Math.floor(frame)
      if (this._frameLabel) {
        this._frameLabel.textContent = `${Math.floor(frame)} / ${Math.floor(total)}`
      }
    }
  
    render() {
      const el = document.createElement('div')
      el.className = 'control-bar'
      el.innerHTML = `
        <div class="ctrl-left">
          <button class="ctrl-btn ctrl-stop" title="Stop">■</button>
          <button class="ctrl-btn ctrl-play" title="Play">▶</button>
        </div>
        <div class="ctrl-middle">
          <input type="range" class="ctrl-scrubber" min="0" max="100" value="0" step="1" />
          <span class="ctrl-frame-label">0 / 0</span>
        </div>
        <div class="ctrl-right">
          <span class="ctrl-speed-label">Speed</span>
          <select class="ctrl-speed">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1" selected>1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      `
  
      document.head.insertAdjacentHTML('beforeend', `
        <style>
          .control-bar {
            display: flex;
            align-items: center;
            gap: 16px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 20px;
          }
  
          .ctrl-left {
            display: flex;
            gap: 8px;
          }
  
          .ctrl-btn {
            background: var(--surface2);
            border: 1px solid var(--border);
            color: var(--text);
            border-radius: 6px;
            width: 36px;
            height: 36px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.15s;
          }
  
          .ctrl-btn:hover {
            background: var(--accent);
            border-color: var(--accent);
          }
  
          .ctrl-middle {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
          }
  
          .ctrl-scrubber {
            flex: 1;
            accent-color: var(--accent);
            height: 4px;
            cursor: pointer;
          }
  
          .ctrl-frame-label {
            font-size: 12px;
            color: var(--text-muted);
            min-width: 70px;
            text-align: right;
            font-variant-numeric: tabular-nums;
          }
  
          .ctrl-right {
            display: flex;
            align-items: center;
            gap: 8px;
          }
  
          .ctrl-speed-label {
            font-size: 12px;
            color: var(--text-muted);
          }
  
          .ctrl-speed {
            background: var(--surface2);
            border: 1px solid var(--border);
            color: var(--text);
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 13px;
            cursor: pointer;
          }
        </style>
      `)
  
      this._scrubber = el.querySelector('.ctrl-scrubber')
      this._frameLabel = el.querySelector('.ctrl-frame-label')
  
      // Play/pause
      el.querySelector('.ctrl-play').addEventListener('click', () => this._togglePlay())
  
      // Stop
      el.querySelector('.ctrl-stop').addEventListener('click', () => {
        this.sync.stop()
        this._isPlaying = false
        this._setPlayIcon(false)
        this.updateFrame(0)
      })
  
      // Scrubber
      this._scrubber.addEventListener('input', (e) => {
        this.sync.pause()
        this._isPlaying = false
        this._setPlayIcon(false)
        this.sync.goToFrame(Number(e.target.value))
        if (this._frameLabel) {
          this._frameLabel.textContent = `${e.target.value} / ${this._scrubber.max}`
        }
      })
  
      // Speed
      el.querySelector('.ctrl-speed').addEventListener('change', (e) => {
        this.sync.setSpeed(Number(e.target.value))
      })
  
      this._el = el
      return el
    }
  }