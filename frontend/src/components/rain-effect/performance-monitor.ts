export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private fps = 60;
  private readonly maxSamples = 60;

  update() {
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const frameTime = now - this.lastFrameTime;
      this.frameTimes.push(frameTime);
      
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
      
      // Calculate average FPS
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.fps = 1000 / avgFrameTime;
    }
    this.lastFrameTime = now;
  }

  getFPS(): number {
    return Math.round(this.fps);
  }

  shouldReduceQuality(): boolean {
    return this.fps < 30;
  }

  shouldDisable(): boolean {
    return this.fps < 20;
  }
}
