import type { Vector3 } from "three";

/** The fields the generic A* and maze steppers read and write on a node. */
export type GraphNode<Self> = {
  id: number;
  visited: boolean;
  obstacle: boolean;
  f: number;
  g: number;
  h: number;
  previous: Self | null;
};

export type Positioned = { center: Vector3 };

/** Straight-line distance between centres: an admissible heuristic and the step cost. */
export function euclidean(a: Positioned, b: Positioned): number {
  return a.center.distanceTo(b.center);
}

export function pickRandom<T>(
  items: readonly T[],
  random: () => number
): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(random() * items.length)] ?? null;
}
