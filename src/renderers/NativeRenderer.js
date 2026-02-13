import lottie from 'lottie-web'

export class NativeRenderer {
  constructor(container, animationData) {
    this.container = container
    this.animationData = animationData
    this.anim = null
  }

  mount() {
    // Native renderers are closest to SVG compositing model
    this.anim = lottie.loadAnimation({
      container: this.container,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      animationData: this.animationData,
      rendererSettings: {
        progressiveLoad: true,
        hideOnTransparent: true,
      }
    })
    return this
  }

  play() { this.anim?.play() }
  pause() { this.anim?.pause() }
  stop() { this.anim?.stop() }
  setSpeed(s) { this.anim?.setSpeed(s) }

  goToFrame(frame) {
    this.anim?.goToAndStop(frame, true)
  }

  getTotalFrames() {
    return this.anim?.totalFrames || 0
  }

  onEnterFrame(cb) {
    this.anim?.addEventListener('enterFrame', (e) => cb(e.currentTime))
  }

  destroy() {
    this.anim?.destroy()
  }
}