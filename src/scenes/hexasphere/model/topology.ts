import { IcosahedronGeometry, Vector3 } from "three";

import { at } from "../../../lib/invariant";

export type IcoTopology = {
  /** Tile centres, in three r117 `IcosahedronGeometry(...).vertices` order. */
  centers: Vector3[];
  /** For each tile, the indices of the tiles that share a triangle edge with it (5 or 6). */
  neighbors: number[][];
};

export type Dedupe = { centers: Vector3[]; remap: Uint32Array };

/**
 * Collapses coincident positions in first-occurrence order, exactly like the
 * legacy `Geometry.mergeVertices` (positions only, rounded to `decimals`).
 * `remap[i]` is the unique index of the i-th input position.
 */
export function dedupeFirstOccurrence(
  positions: ArrayLike<number>,
  decimals = 4
): Dedupe {
  const scale = 10 ** decimals;
  const ids = new Map<string, number>();
  const centers: Vector3[] = [];
  const count = Math.floor(positions.length / 3);
  const remap = new Uint32Array(count);

  for (let i = 0; i < count; i++) {
    const x = at(positions, 3 * i);
    const y = at(positions, 3 * i + 1);
    const z = at(positions, 3 * i + 2);
    const key = `${Math.round(x * scale)},${Math.round(y * scale)},${Math.round(z * scale)}`;
    let id = ids.get(key);
    if (id === undefined) {
      id = centers.length;
      ids.set(key, id);
      centers.push(new Vector3(x, y, z));
    }
    remap[i] = id;
  }

  return { centers, remap };
}

/**
 * Builds the tile centres and adjacency of a subdivided icosahedron.
 *
 * `detail` keeps the r117 meaning (each edge split into 2^detail segments)
 * because `ReadyMazes.js` and the tile ids depend on it. three r125 changed
 * the parameter to `detail + 1` segments, hence `2 ** detail - 1`.
 */
export function buildIcoTopology(size: number, detail: number): IcoTopology {
  const geometry = new IcosahedronGeometry(size, 2 ** detail - 1);
  const { centers, remap } = dedupeFirstOccurrence(
    geometry.getAttribute("position").array
  );
  geometry.dispose();

  const sets = centers.map(() => new Set<number>());
  for (let t = 0; t + 2 < remap.length; t += 3) {
    const a = at(remap, t);
    const b = at(remap, t + 1);
    const c = at(remap, t + 2);
    link(sets, a, b);
    link(sets, b, c);
    link(sets, c, a);
  }

  return { centers, neighbors: sets.map((set) => [...set]) };
}

function link(sets: Set<number>[], a: number, b: number): void {
  if (a === b) return;
  at(sets, a).add(b);
  at(sets, b).add(a);
}

/**
 * Orders `points` counter-clockwise around `center` as seen from outside the
 * sphere. Returns indices into `points`.
 */
export function ringOrder(
  center: Vector3,
  points: readonly Vector3[]
): number[] {
  const n = center.clone().normalize();
  const seed =
    Math.abs(n.x) < 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const u = new Vector3().crossVectors(seed, n).normalize();
  const v = new Vector3().crossVectors(n, u);
  const d = new Vector3();

  return points
    .map((point, index) => {
      d.subVectors(point, center);
      return { index, angle: Math.atan2(d.dot(v), d.dot(u)) };
    })
    .sort((a, b) => a.angle - b.angle)
    .map((entry) => entry.index);
}
