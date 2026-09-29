import { Matrix4, Quaternion, Vector3 } from "three";

export const FACE_NAMES = [
  "top",
  "front",
  "right",
  "left",
  "back",
  "bot",
] as const;
export type FaceName = (typeof FACE_NAMES)[number];

/** Folded into a cube, or laid flat as the cross-shaped net. */
export type Formation = "cube" | "net";

export type FaceDef = {
  readonly name: FaceName;
  /** Outward normal in folded space; the face group's local +y. */
  readonly normal: Vector3;
  /** Where the face's local +x (increasing cell x) points in folded space. */
  readonly u: Vector3;
  /** Where the face's local +z (increasing cell y) points in folded space. */
  readonly v: Vector3;
  /** Offset in the unfolded cross, in side lengths: [x, z]. */
  readonly net: readonly [number, number];
};

type Triple = readonly [number, number, number];

function define(
  name: FaceName,
  normal: Triple,
  u: Triple,
  v: Triple,
  net: readonly [number, number]
): FaceDef {
  return {
    name,
    normal: new Vector3(...normal),
    u: new Vector3(...u),
    v: new Vector3(...v),
    net,
  };
}

/**
 * One row per face. The net is the legacy cross (top in the middle, bot below
 * back); `u` and `v` are what each face's net axes become once it is folded
 * along the cross's creases, so a single table drives both layouts. Every
 * triple `(u, normal, v)` is right-handed.
 */
export const FACES: Record<FaceName, FaceDef> = {
  top: define("top", [0, 1, 0], [1, 0, 0], [0, 0, 1], [0, 0]),
  front: define("front", [0, 0, 1], [1, 0, 0], [0, -1, 0], [0, 1]),
  right: define("right", [1, 0, 0], [0, -1, 0], [0, 0, 1], [1, 0]),
  left: define("left", [-1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0]),
  back: define("back", [0, 0, -1], [1, 0, 0], [0, 1, 0], [0, -1]),
  bot: define("bot", [0, -1, 0], [1, 0, 0], [0, 0, -1], [0, -2]),
};

/** The legacy three-sided cube: the faces that meet at one corner. */
export const THREE_SIDES: readonly FaceName[] = ["top", "front", "right"];

export type CubeOptions = {
  /** Cells per face edge. */
  size: number;
  cellSize: number;
  sides: 3 | 6;
  /** Scatter obstacle clusters (the A* scene). */
  obstacles: boolean;
  /** Link the four in-face diagonals as well (the A* scene). */
  fullNeighbors: boolean;
};

export function facesFor(sides: 3 | 6): readonly FaceName[] {
  return sides === 3 ? THREE_SIDES : FACE_NAMES;
}

/** Half the side length: the distance from the cube's centre to each face. */
export function halfSide(size: number, cellSize: number): number {
  return (size * cellSize) / 2;
}

/** Height above a face at which the path line and tracker travel. */
export function pathLift(cellSize: number): number {
  return cellSize * 0.35;
}

export type Transform = { position: Vector3; quaternion: Quaternion };

/** Where a face group sits in a formation. Both are expressed in the root's space. */
export function faceTransform(
  face: FaceName,
  formation: Formation,
  size: number,
  cellSize: number
): Transform {
  const def = FACES[face];
  const h = halfSide(size, cellSize);
  if (formation === "net") {
    return {
      position: new Vector3(def.net[0] * 2 * h, h, def.net[1] * 2 * h),
      quaternion: new Quaternion(),
    };
  }
  const basis = new Matrix4().makeBasis(def.u, def.normal, def.v);
  return {
    position: def.normal.clone().multiplyScalar(h),
    quaternion: new Quaternion().setFromRotationMatrix(basis),
  };
}

/** A cell's centre in its face group's space (on the face plane, y = 0). */
export function cellLocalPosition(
  x: number,
  y: number,
  size: number,
  cellSize: number,
  out = new Vector3()
): Vector3 {
  const h = halfSide(size, cellSize);
  return out.set((x + 0.5) * cellSize - h, 0, (y + 0.5) * cellSize - h);
}

/** A cell's centre in the root's space for a formation. */
export function cellPosition(
  face: FaceName,
  formation: Formation,
  x: number,
  y: number,
  size: number,
  cellSize: number
): Vector3 {
  const transform = faceTransform(face, formation, size, cellSize);
  return cellLocalPosition(x, y, size, cellSize)
    .applyQuaternion(transform.quaternion)
    .add(transform.position);
}
