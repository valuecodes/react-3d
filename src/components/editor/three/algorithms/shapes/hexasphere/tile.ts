import type { Vector3 } from "three";

import { WALL } from "../../../../../../context/options";
import type { ColorIndex, WallState } from "../../../../../../context/options";
import type { ColorPainter } from "./painter";

/**
 * One hexagon (or pentagon) of the sphere. Colour changes go through the
 * painters; the geometry attributes are never touched directly.
 */
export class Tile {
  /** Neighbouring tiles, counter-clockwise as seen from outside. */
  neighbors: Tile[] = [];
  /** `wallToNeighbor[k]` is the neighbour on the other side of wall `k`. */
  wallToNeighbor: Tile[] = [];
  /** Neighbours reachable through open walls (maze passages). */
  availableNeighbors: Tile[] = [];
  /** `wallOpen[k]` is true when wall `k` has been removed. */
  wallOpen: boolean[];

  visited = false;
  obstacle = false;
  start = false;
  target = false;

  // A* bookkeeping
  f = 0;
  g = 0;
  h = 0;
  previous: Tile | null = null;

  constructor(
    readonly id: number,
    readonly center: Vector3,
    readonly isPentagon: boolean,
    /** Corner positions, counter-clockwise; corner k sits between neighbours k and k+1. */
    readonly corners: readonly Vector3[],
    /** First triangle of this tile in the tile geometry. */
    readonly triStart: number,
    readonly triCount: number,
    /** First triangle of this tile's walls in the wall geometry; wall k owns triangles wallTriStart + 2k and + 2k + 1. */
    readonly wallTriStart: number,
    readonly baseColor: ColorIndex,
    private readonly tilePainter: ColorPainter,
    private readonly wallPainter: ColorPainter
  ) {
    this.wallOpen = corners.map(() => false);
  }

  get wallCount(): number {
    return this.corners.length;
  }

  /** Recolours the tile unless it is the start or target, which keep their marker colour. */
  setColor(index: ColorIndex): void {
    if (this.start || this.target) return;
    this.tilePainter.fillTriangles(this.triStart, this.triCount, index);
  }

  /** Paints every wall with one state and closes them all. */
  setWallColors(state: WallState): void {
    this.wallPainter.fillTriangles(
      this.wallTriStart,
      2 * this.wallCount,
      state
    );
    this.wallOpen.fill(false);
  }

  /** Hides the open walls. Closed walls keep their current colour. */
  setWalls(): void {
    this.wallOpen.forEach((open, k) => {
      if (open) this.paintWall(k, WALL.invisible);
    });
  }

  removeWall(k: number): void {
    if (k < 0 || k >= this.wallCount) return;
    this.paintWall(k, WALL.invisible);
    this.wallOpen[k] = true;
  }

  /** Index of the wall facing `other`, or undefined when the tiles are not neighbours. */
  wallFacing(other: Tile): number | undefined {
    const k = this.wallToNeighbor.indexOf(other);
    return k === -1 ? undefined : k;
  }

  /** A random unvisited neighbour, or null when all have been visited. */
  getNextNeighbor(): Tile | null {
    const unvisited = this.neighbors.filter((neighbor) => !neighbor.visited);
    if (unvisited.length === 0) return null;
    return unvisited[Math.floor(Math.random() * unvisited.length)] ?? null;
  }

  private paintWall(k: number, state: WallState): void {
    this.wallPainter.fillTriangles(this.wallTriStart + 2 * k, 2, state);
  }
}
