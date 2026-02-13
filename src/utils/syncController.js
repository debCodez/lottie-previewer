export class SyncController {
    constructor() {
      this.renderers = []
      this.isPlaying = false
      this.speed = 1
    }
  
    register(renderer) {
      this.renderers.push(renderer)
    }
  
    unregisterAll() {
      this.renderers = []
    }
  
    play() {
      this.isPlaying = true
      this.renderers.forEach(r => r.play())
    }
  
    pause() {
      this.isPlaying = false
      this.renderers.forEach(r => r.pause())
    }
  
    stop() {
      this.isPlaying = false
      this.renderers.forEach(r => r.stop())
    }
  
    setSpeed(speed) {
      this.speed = speed
      this.renderers.forEach(r => r.setSpeed(speed))
    }
  
    goToFrame(frame) {
      this.renderers.forEach(r => r.goToFrame(frame))
    }
  
    getTotalFrames() {
      // Return the first renderer's total frames as reference
      if (this.renderers.length === 0) return 0
      return this.renderers[0].getTotalFrames()
    }
  
    destroyAll() {
      this.renderers.forEach(r => r.destroy())
      this.renderers = []
      this.isPlaying = false
    }
  }