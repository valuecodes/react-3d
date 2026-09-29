import { Vector3 } from "three";

import type { GraphNode } from "../../lib/graph/graphNode";
import { at, invariant } from "../../lib/invariant";
import {
  cellPosition,
  FACES,
  facesFor,
  halfSide,
  pathLift,
} from "./formations";
import type { CubeOptions, FaceDef, FaceName } from "./formations";

export type Sides<T> = [T, T, T, T];

/** Grid steps for the four sides: north (y-1), east (x+1), south (y+1), west (x-1). */
export const SIDE_STEPS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

const DIAGONAL_STEPS: readonly (readonly [number, number])[] = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

/** The folded-space direction a side faces. */
export function sideDirection(
  def: FaceDef,
  side: number,
  out = new Vector3()
): Vector3 {
  switch (side) {
    case 0:
      return out.copy(def.v).negate();
    case 1:
      return out.copy(def.u);
    case 2:
      return out.copy(def.v);
    default:
      return out.copy(def.u).negate();
  }
}

export class CubeCell implements GraphNode<CubeCell> {
  visited = false;
  obstacle = false;
  start = false;
  target = false;
  f = 0;
  g = 0;
  h = 0;
  previous: CubeCell | null = null;
  /** Every linked cell: the four sides, the diagonals when enabled, and the cross-face partners. */
  readonly neighbors: CubeCell[] = [];
  /** Side neighbours by side index; null on an unmatched border. */
  readonly sideTo: Sides<CubeCell | null> = [null, null, null, null];
  /** Closed walls by side index. Border sides stay closed unless a passage crosses faces. */
  readonly walls: Sides<boolean> = [true, true, true, true];
  /** Side neighbours reachable through an open wall (the maze graph). */
  readonly passages: CubeCell[] = [];
  /** Side neighbours on another face. */
  readonly crossLinks: CubeCell[] = [];

  constructor(
    readonly id: number,
    readonly face: FaceName,
    /** Index of the face in `Cube.faces`. */
    readonly faceIndex: number,
    /** Index within the face (`y * size + x`), which is also the instance id. */
    readonly index: number,
    readonly x: number,
    readonly y: number,
    /** Centre on the folded cube, in the root's space. */
    readonly center: Vector3
  ) {}

  /** The side index that faces `other`, or null when it is not a side neighbour. */
  sideFacing(other: CubeCell): number | null {
    const side = this.sideTo.indexOf(other);
    return side === -1 ? null : side;
  }
}

export type CubeFace = {
  readonly name: FaceName;
  readonly def: FaceDef;
  readonly index: number;
  /** Row-major, `y * size + x`. */
  readonly cells: readonly CubeCell[];
};

export type Cube = {
  readonly options: CubeOptions;
  readonly faces: readonly CubeFace[];
  readonly cells: readonly CubeCell[];
  readonly halfSide: number;
};

function link(a: CubeCell, b: CubeCell): void {
  a.neighbors.push(b);
  b.neighbors.push(a);
}

function midpointKey(point: Vector3, unit: number): string {
  return `${Math.round(point.x / unit)},${Math.round(point.y / unit)},${Math.round(point.z / unit)}`;
}

/**
 * Builds the faces and links every cell to its side neighbours: within a face
 * by grid step, across faces by matching the exact midpoint of the shared
 * border edge in folded space.
 */
export function createCube(options: CubeOptions): Cube {
  const { size, cellSize } = options;
  const faces: CubeFace[] = [];
  const cells: CubeCell[] = [];

  facesFor(options.sides).forEach((name, faceIndex) => {
    const faceCells: CubeCell[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = new CubeCell(
          cells.length,
          name,
          faceIndex,
          faceCells.length,
          x,
          y,
          cellPosition(name, "cube", x, y, size, cellSize)
        );
        faceCells.push(cell);
        cells.push(cell);
      }
    }
    faces.push({ name, def: FACES[name], index: faceIndex, cells: faceCells });
  });

  const inFace = (face: CubeFace, x: number, y: number) =>
    x >= 0 && y >= 0 && x < size && y < size
      ? at(face.cells, y * size + x)
      : null;

  for (const face of faces) {
    for (const cell of face.cells) {
      SIDE_STEPS.forEach(([dx, dy], side) => {
        const neighbor = inFace(face, cell.x + dx, cell.y + dy);
        if (!neighbor) return;
        cell.sideTo[side] = neighbor;
        cell.neighbors.push(neighbor);
      });
      if (options.fullNeighbors) {
        for (const [dx, dy] of DIAGONAL_STEPS) {
          const neighbor = inFace(face, cell.x + dx, cell.y + dy);
          if (neighbor) cell.neighbors.push(neighbor);
        }
      }
    }
  }

  // Border edges: the midpoint of a border edge lies on a cube edge, and the
  // matching border edge of the adjacent face has exactly the same midpoint.
  const unit = cellSize / 4;
  const border = new Map<string, { cell: CubeCell; side: number }>();
  const midpoint = new Vector3();
  for (const face of faces) {
    for (const cell of face.cells) {
      for (let side = 0; side < 4; side++) {
        if (cell.sideTo[side]) continue;
        sideDirection(face.def, side, midpoint)
          .multiplyScalar(cellSize / 2)
          .add(cell.center);
        const key = midpointKey(midpoint, unit);
        const other = border.get(key);
        if (other && other.cell.face !== cell.face) {
          cell.sideTo[side] = other.cell;
          other.cell.sideTo[other.side] = cell;
          link(cell, other.cell);
          cell.crossLinks.push(other.cell);
          other.cell.crossLinks.push(cell);
          border.delete(key);
        } else {
          border.set(key, { cell, side });
        }
      }
    }
  }

  return { options, faces, cells, halfSide: halfSide(size, cellSize) };
}

/** Opens the wall between two side neighbours on both cells (and so on both faces). */
export function removeWallsBetween(a: CubeCell, b: CubeCell): void {
  const sideA = a.sideFacing(b);
  const sideB = b.sideFacing(a);
  invariant(sideA !== null && sideB !== null, "Cells are not side neighbours");
  a.walls[sideA] = false;
  b.walls[sideB] = false;
  if (!a.passages.includes(b)) a.passages.push(b);
  if (!b.passages.includes(a)) b.passages.push(a);
}

/** Clears the search and maze state on every cell; keeps obstacles and markers. */
export function resetRun(cube: Cube): void {
  for (const cell of cube.cells) {
    cell.visited = false;
    cell.f = 0;
    cell.g = 0;
    cell.h = 0;
    cell.previous = null;
    cell.walls.fill(true);
    cell.passages.length = 0;
  }
}

/** Clears everything, obstacles and markers included. */
export function resetCells(cube: Cube): void {
  resetRun(cube);
  for (const cell of cube.cells) {
    cell.obstacle = false;
    cell.start = false;
    cell.target = false;
  }
}

/**
 * The legacy obstacle scatter: each cell has a `chance` of seeding a short
 * run along its row, and the same chance of seeding a run down its column.
 */
export function layObstacles(
  cube: Cube,
  random: () => number,
  chance = 0.02
): void {
  const { size } = cube.options;
  const mark = (face: CubeFace, index: number) => {
    const cell = face.cells[index];
    if (cell) cell.obstacle = true;
  };
  for (const face of cube.faces) {
    for (let i = 0; i < face.cells.length; i++) {
      if (random() < chance) {
        for (const offset of [0, 1, -1, 2, 3]) mark(face, i + offset);
      }
      if (random() < chance) {
        for (const offset of [0, size, -size, 2 * size, -2 * size]) {
          mark(face, i + offset);
        }
      }
    }
  }
}

/**
 * A point along a drawn path. Cell points float above the cell; when two
 * consecutive cells lie on different faces, a point above the shared edge is
 * inserted between them so the line wraps around the cube edge.
 */
export type PathPoint = {
  /** In folded space, lifted above the surface. */
  readonly center: Vector3;
  readonly cell: CubeCell;
  /** For an edge point: the cell before it (on the other face). */
  readonly partner: CubeCell | null;
};

function liftedCenter(cube: Cube, cell: CubeCell): Vector3 {
  const face = at(cube.faces, cell.faceIndex);
  return cell.center
    .clone()
    .addScaledVector(face.def.normal, pathLift(cube.options.cellSize));
}

/** The folded-space point above the edge shared by two side neighbours on different faces. */
export function liftedEdgePoint(
  cube: Cube,
  from: CubeCell,
  to: CubeCell
): Vector3 {
  const { cellSize } = cube.options;
  const lift = pathLift(cellSize);
  const fromFace = at(cube.faces, from.faceIndex);
  const toFace = at(cube.faces, to.faceIndex);
  const side = from.sideFacing(to);
  if (side === null) {
    return from.center.clone().add(to.center).multiplyScalar(0.5);
  }
  return sideDirection(fromFace.def, side)
    .multiplyScalar(cellSize / 2)
    .add(from.center)
    .addScaledVector(fromFace.def.normal, lift)
    .addScaledVector(toFace.def.normal, lift);
}

/** Folded-space points for a cell sequence (start first). At most `2 * cells.length` points. */
export function pathPoints(
  cube: Cube,
  cells: readonly CubeCell[]
): PathPoint[] {
  const points: PathPoint[] = [];
  let previous: CubeCell | null = null;
  for (const cell of cells) {
    if (previous && previous.face !== cell.face) {
      points.push({
        center: liftedEdgePoint(cube, previous, cell),
        cell,
        partner: previous,
      });
    }
    points.push({ center: liftedCenter(cube, cell), cell, partner: null });
    previous = cell;
  }
  return points;
}
