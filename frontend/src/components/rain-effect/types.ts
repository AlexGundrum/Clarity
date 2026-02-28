export interface Raindrop {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trail: TrailPoint[];
  opacity: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export interface RainConfig {
  maxDrops: number;
  gravity: number;
  windStrength: number;
  mergeThreshold: number;
  minSize: number;
  maxSize: number;
  refractionStrength: number;
}
