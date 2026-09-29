/** Pure grid layout for the instancing demo: where each instance sits and how the wave moves it. */

export type Cell = { col: number; row: number };

export type Range = { min: number; max: number; step?: number };

export const SIDE_RANGE: Range = { min: 10, max: 100 };
export const SPACING_RANGE: Range = { min: 2, max: 8, step: 0.5 };
export const AMPLITUDE_RANGE: Range = { min: 0, max: 20 };

/** Wave length in cells along the travelling diagonal. */
export const WAVE_LENGTH = 16;
/** Angular frequency in radians per second. */
export const WAVE_SPEED = 2;

/** Row-major cell of instance `index` in a `side` x `side` grid. */
export function cellOf(index: number, side: number): Cell {
  return { col: index % side, row: Math.floor(index / side) };
}

/** Ground-plane position of a cell, with the whole grid centred on the origin. */
export function instancePosition(
  col: number,
  row: number,
  side: number,
  spacing: number
): { x: number; z: number } {
  const half = (side - 1) / 2;
  return { x: (col - half) * spacing, z: (row - half) * spacing };
}

/** Height of a smooth sine wave travelling along the grid diagonal. */
export function waveHeight(
  col: number,
  row: number,
  time: number,
  amplitude: number
): number {
  const k = (2 * Math.PI) / WAVE_LENGTH;
  return amplitude * Math.sin(k * (col + row) - WAVE_SPEED * time);
}
