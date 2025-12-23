export type AppState = 'landing' | 'animating' | 'finished';

export interface Particle {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  alpha: number;
  targetY: number;
  targetRadius: number;
  angle: number;
  speed: number;
  originalY: number;
  state: 'rising' | 'settled';
}

export interface SnowFlake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  alpha: number;
}