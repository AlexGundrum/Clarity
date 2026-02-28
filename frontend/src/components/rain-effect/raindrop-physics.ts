import { Raindrop, TrailPoint, RainConfig } from './types';

export class RaindropPhysics {
  private drops: Raindrop[] = [];
  private nextId = 0;
  private config: RainConfig;

  constructor(config: RainConfig) {
    this.config = config;
  }

  createDrop(x?: number, y?: number): Raindrop {
    return {
      id: this.nextId++,
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? -20,
      vx: (Math.random() - 0.5) * this.config.windStrength,
      vy: Math.random() * 2 + 1,
      size: this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
      trail: [],
      opacity: 0.6 + Math.random() * 0.4,
    };
  }

  addDrop(drop?: Raindrop) {
    if (this.drops.length < this.config.maxDrops) {
      this.drops.push(drop || this.createDrop());
    }
  }

  update(deltaTime: number) {
    const dt = Math.min(deltaTime / 16.67, 2); // Cap delta time to prevent huge jumps

    // Update existing drops
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];

      // Add current position to trail
      if (drop.trail.length === 0 || 
          Math.abs(drop.x - drop.trail[drop.trail.length - 1].x) > 2 ||
          Math.abs(drop.y - drop.trail[drop.trail.length - 1].y) > 2) {
        drop.trail.push({
          x: drop.x,
          y: drop.y,
          opacity: drop.opacity * 0.5,
        });
      }

      // Apply gravity (larger drops fall faster)
      drop.vy += this.config.gravity * dt * (drop.size / this.config.maxSize);

      // Apply wind drift
      drop.vx += (Math.random() - 0.5) * this.config.windStrength * 0.1 * dt;

      // Update position
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;

      // Fade and remove old trail points
      drop.trail = drop.trail
        .map(point => ({ ...point, opacity: point.opacity * 0.92 }))
        .filter(point => point.opacity > 0.05);

      // Keep only last 15 trail points for performance
      if (drop.trail.length > 15) {
        drop.trail = drop.trail.slice(-15);
      }

      // Remove drops that are off screen
      if (drop.y > window.innerHeight + 50 || drop.x < -50 || drop.x > window.innerWidth + 50) {
        this.drops.splice(i, 1);
      }
    }

    // Check for merging
    this.checkMerging();

    // Spawn new drops to maintain count
    while (this.drops.length < this.config.maxDrops) {
      this.addDrop();
    }
  }

  private checkMerging() {
    for (let i = 0; i < this.drops.length; i++) {
      for (let j = i + 1; j < this.drops.length; j++) {
        const drop1 = this.drops[i];
        const drop2 = this.drops[j];

        const dx = drop1.x - drop2.x;
        const dy = drop1.y - drop2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.mergeThreshold) {
          // Merge drop2 into drop1
          const totalSize = Math.sqrt(drop1.size * drop1.size + drop2.size * drop2.size);
          drop1.size = Math.min(totalSize, this.config.maxSize * 1.5);
          drop1.x = (drop1.x + drop2.x) / 2;
          drop1.y = (drop1.y + drop2.y) / 2;
          drop1.vx = (drop1.vx + drop2.vx) / 2;
          drop1.vy = (drop1.vy + drop2.vy) / 2;
          drop1.opacity = Math.max(drop1.opacity, drop2.opacity);

          // Remove drop2
          this.drops.splice(j, 1);
          j--;
        }
      }
    }
  }

  getDrops(): Raindrop[] {
    return this.drops;
  }

  setMaxDrops(max: number) {
    this.config.maxDrops = max;
  }
}
