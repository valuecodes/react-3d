import { Vector3 } from "three";

import type { AStarHooks } from "../../lib/graph/aStar";
import { euclidean } from "../../lib/graph/graphNode";
import type { GraphNode } from "../../lib/graph/graphNode";
import type { MazeHooks } from "../../lib/graph/mazeBacktracker";
import { at } from "../../lib/invariant";

export const GRID_VARIANTS = ["astar", "maze", "mazePathfinder"] as const;
export type GridVariant = (typeof GRID_VARIANTS)[number];

export type GridOptions = {
  rows: number;
  cols: number;
  /** World units between neighbouring cell centres. */
  cellSize: number;
  /** Chance per cell of seeding a three-cell obstacle run (A* variant only). */
  wallChance: number;
  /** Eight neighbours instead of four (A* variant only). */
  diagonal: boolean;
};

export const ROWS_RANGE = { min: 3, max: 30 } as const;
export const COLS_RANGE = { min: 3, max: 30 } as const;
export const WALL_CHANCE_RANGE = { min: 0, max: 0.3, step: 0.01 } as const;

export function defaultGridOptions(variant: GridVariant): GridOptions {
  return {
    rows: 12,
    cols: 12,
    cellSize: 5,
    wallChance: variant === "astar" ? 0.05 : 0,
    diagonal: false,
  };
}

/** Cardinal sides in `sideTo` / `walls` order: north (row - 1), east (col + 1), south, west. */
export type Side = 0 | 1 | 2 | 3;
export const SIDES: readonly Side[] = [0, 1, 2, 3];
export const OPPOSITE: Readonly<Record<Side, Side>> = {
  0: 2,
  1: 3,
  2: 0,
  3: 1,
};
const SIDE_OFFSETS: Readonly<
  Record<Side, readonly [dRow: number, dCol: number]>
> = {
  0: [-1, 0],
  1: [0, 1],
  2: [1, 0],
  3: [0, -1],
};
const DIAGONAL_OFFSETS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [-1, 1],
  [1, 1],
  [1, -1],
];

type SideLinks = [
  GridCell | null,
  GridCell | null,
  GridCell | null,
  GridCell | null,
];
type Walls = [boolean, boolean, boolean, boolean];

/** One square of the board. Rows run along z, columns along x, the board is centred on the origin. */
export class GridCell implements GraphNode<GridCell> {
  /** All adjacent cells: the cardinal ones, plus the diagonals when enabled. */
  neighbors: GridCell[] = [];
  /** Cardinal neighbours by side, null at the border. */
  sideTo: SideLinks = [null, null, null, null];
  /** Closed walls by side; maze carving opens them. */
  walls: Walls = [true, true, true, true];
  /** Cells reachable through an open wall. */
  passages: GridCell[] = [];
  visited = false;
  obstacle = false;
  start = false;
  target = false;
  f = 0;
  g = 0;
  h = 0;
  previous: GridCell | null = null;

  constructor(
    readonly id: number,
    readonly row: number,
    readonly col: number,
    readonly center: Vector3
  ) {}

  /** The side of this cell that faces `other`, or null unless they are cardinal neighbours. */
  sideFacing(other: GridCell): Side | null {
    for (const side of SIDES) if (this.sideTo[side] === other) return side;
    return null;
  }
}

export type Grid = {
  readonly options: GridOptions;
  /** Row-major: `cells[row * cols + col]`, which is also each cell's `id`. */
  readonly cells: readonly GridCell[];
  cellAt(row: number, col: number): GridCell | null;
};

/** World position of a cell centre; the board is centred on the origin at y = 0. */
export function cellCenter(
  options: Pick<GridOptions, "rows" | "cols" | "cellSize">,
  row: number,
  col: number
): Vector3 {
  const { rows, cols, cellSize } = options;
  return new Vector3(
    (col - (cols - 1) / 2) * cellSize,
    0,
    (row - (rows - 1) / 2) * cellSize
  );
}

/** Builds the cells and links them; seeds obstacles when `wallChance` is above zero. */
export function createGrid(
  options: GridOptions,
  random: () => number = Math.random
): Grid {
  const { rows, cols } = options;
  const cells: GridCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push(
        new GridCell(cells.length, row, col, cellCenter(options, row, col))
      );
    }
  }
  const cellAt = (row: number, col: number): GridCell | null => {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    return cells[row * cols + col] ?? null;
  };

  for (const cell of cells) {
    for (const side of SIDES) {
      const [dRow, dCol] = SIDE_OFFSETS[side];
      const other = cellAt(cell.row + dRow, cell.col + dCol);
      cell.sideTo[side] = other;
      if (other) cell.neighbors.push(other);
    }
    if (options.diagonal) {
      for (const [dRow, dCol] of DIAGONAL_OFFSETS) {
        const other = cellAt(cell.row + dRow, cell.col + dCol);
        if (other) cell.neighbors.push(other);
      }
    }
  }

  const grid: Grid = { options, cells, cellAt };
  if (options.wallChance > 0)
    randomizeObstacles(grid, options.wallChance, random);
  return grid;
}

/** Opens the wall between two cardinal neighbours and records the passage. Ignores other pairs. */
export function removeWallsBetween(a: GridCell, b: GridCell): boolean {
  const side = a.sideFacing(b);
  if (side === null) return false;
  a.walls[side] = false;
  b.walls[OPPOSITE[side]] = false;
  if (!a.passages.includes(b)) a.passages.push(b);
  if (!b.passages.includes(a)) b.passages.push(a);
  return true;
}

/** Closes every wall and forgets the maze walk, keeping obstacles and markers. */
export function closeAllWalls(grid: Grid): void {
  for (const cell of grid.cells) {
    cell.walls = [true, true, true, true];
    cell.passages = [];
    cell.visited = false;
  }
}

export function clearObstacles(grid: Grid): void {
  for (const cell of grid.cells) cell.obstacle = false;
}

/**
 * Seeds obstacles the way the legacy scene did: each cell has `chance` of
 * starting a three-cell run to the east and `chance` of starting one to the
 * south. Start and target cells are never covered.
 */
export function randomizeObstacles(
  grid: Grid,
  chance: number,
  random: () => number
): void {
  const run = (cell: GridCell, dRow: number, dCol: number) => {
    for (let k = 0; k < 3; k++) {
      const other = grid.cellAt(cell.row + k * dRow, cell.col + k * dCol);
      if (other && !other.start && !other.target) other.obstacle = true;
    }
  };
  for (const cell of grid.cells) {
    if (random() < chance) run(cell, 0, 1);
    if (random() < chance) run(cell, 1, 0);
  }
}

/** A* over open ground: any neighbour that is not an obstacle. */
export function openNeighbors(cell: GridCell): readonly GridCell[] {
  return cell.neighbors.filter((neighbor) => !neighbor.obstacle);
}

/** A* through a maze: only neighbours behind an open wall. */
export function passageNeighbors(cell: GridCell): readonly GridCell[] {
  return cell.passages;
}

/** Maze carving moves cardinally only, so the diagonal toggle never affects it. */
export function unvisitedSideNeighbors(cell: GridCell): readonly GridCell[] {
  const result: GridCell[] = [];
  for (const side of SIDES) {
    const other = cell.sideTo[side];
    if (other && !other.visited) result.push(other);
  }
  return result;
}

/** Step cost and heuristic are both the straight-line distance, so diagonals cost sqrt(2) cells. */
export const OPEN_ASTAR_HOOKS: AStarHooks<GridCell> = {
  neighborsOf: openNeighbors,
  heuristic: euclidean,
  cost: euclidean,
};

export const MAZE_ASTAR_HOOKS: AStarHooks<GridCell> = {
  neighborsOf: passageNeighbors,
  heuristic: euclidean,
  cost: euclidean,
};

export function mazeHooks(random: () => number): MazeHooks<GridCell> {
  return {
    unvisitedNeighbors: unvisitedSideNeighbors,
    removeWallsBetween,
    random,
  };
}

export function firstCell(grid: Grid): GridCell {
  return at(grid.cells, 0);
}

export function lastCell(grid: Grid): GridCell {
  return at(grid.cells, grid.cells.length - 1);
}
