export const palette = {
  bg: '#0B0B0F',
  surface: '#17171C',
  surfaceAlt: '#212129',
  text: '#FFFFFF',
  textDim: '#9BA0AA',
  accent: '#4C9AFF',
  border: '#2A2A33',
  danger: '#FF6B6B',
  success: '#4ADE80',
} as const;

/** Velocidades disponibles (foco en la zona lenta para aprendizaje). */
export const SPEEDS = [0.25, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0] as const;

export const DEFAULT_SPEED_INDEX = SPEEDS.length - 1;

export function nearestSpeedIndex(speed: number): number {
  let best = DEFAULT_SPEED_INDEX;
  let bestDiff = Number.POSITIVE_INFINITY;
  SPEEDS.forEach((value, index) => {
    const diff = Math.abs(value - speed);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = index;
    }
  });
  return best;
}

export function formatSpeed(speed: number): string {
  return `${Number(speed.toFixed(2))}x`;
}
