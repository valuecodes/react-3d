import { describe, expect, it } from "vitest";

import { startAStar, stepAStar } from "../../lib/graph/aStar";
import type { AStarState } from "../../lib/graph/aStar";
import { euclidean } from "../../lib/graph/graphNode";
import { startMaze, stepMaze } from "../../lib/graph/mazeBacktracker";
import { seededRandom } from "../../lib/graph/random";
import { at } from "../../lib/invariant";
import {
  createGrid,
  defaultGridOptions,
  firstCell,
  lastCell,
  mazeHooks,
  OPEN_ASTAR_HOOKS,
  openNeighbors,
  OPPOSITE,
  randomizeObstacles,
  SIDES,
} from "./grid";
import type { Grid, GridCell, GridOptions } from "./grid";

function makeGrid(patch: Partial<GridOptions> = {}): Grid {
  return createGrid({
    ...defaultGridOptions("maze"),
    rows: 10,
    cols: 10,
    cellSize: 1,
    ...patch,
  });
}

function cell(grid: Grid, row: number, col: number): GridCell {
  const found = grid.cellAt(row, col);
  if (!found) throw new Error(`No cell at ${row},${col}`);
  return found;
}

function runAStar(
  grid: Grid,
  start: GridCell,
  target: GridCell
): AStarState<GridCell> {
  const state = startAStar(grid.cells, start, target, OPEN_ASTAR_HOOKS);
  let guard = 100_000;
  while (state.running && guard-- > 0) stepAStar(state, OPEN_ASTAR_HOOKS);
  expect(state.running).toBe(false);
  return state;
}

/** Dijkstra over open ground with euclidean step costs: the reference A* must match. */
function shortestCost(grid: Grid, start: GridCell, target: GridCell): number {
  const dist = new Map<GridCell, number>([[start, 0]]);
  const open = new Set<GridCell>([start]);
  const settled = new Set<GridCell>();
  while (open.size > 0) {
    let best: GridCell | null = null;
    for (const node of open) {
      if (!best || (dist.get(node) ?? Infinity) < (dist.get(best) ?? Infinity))
        best = node;
    }
    if (!best) break;
    open.delete(best);
    settled.add(best);
    const d = dist.get(best) ?? Infinity;
    if (best === target) return d;
    for (const neighbor of openNeighbors(best)) {
      if (settled.has(neighbor)) continue;
      const alt = d + euclidean(best, neighbor);
      if (alt < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, alt);
        open.add(neighbor);
      }
    }
  }
  return Infinity;
}

describe("createGrid", () => {
  it("links 2, 3 or 4 cardinal neighbours", () => {
    const grid = makeGrid({ rows: 5, cols: 5 });
    expect(cell(grid, 0, 0).neighbors).toHaveLength(2);
    expect(cell(grid, 0, 2).neighbors).toHaveLength(3);
    expect(cell(grid, 2, 2).neighbors).toHaveLength(4);
    expect(cell(grid, 4, 4).neighbors).toHaveLength(2);
    for (const c of grid.cells) {
      for (const side of SIDES) {
        const other = c.sideTo[side];
        if (other) expect(other.sideTo[OPPOSITE[side]]).toBe(c);
      }
    }
  });

  it("links 3, 5 or 8 neighbours with diagonals", () => {
    const grid = makeGrid({ rows: 5, cols: 5, diagonal: true });
    expect(cell(grid, 0, 0).neighbors).toHaveLength(3);
    expect(cell(grid, 0, 2).neighbors).toHaveLength(5);
    expect(cell(grid, 2, 2).neighbors).toHaveLength(8);
    // Diagonals never become sides.
    expect(cell(grid, 2, 2).sideTo.filter(Boolean)).toHaveLength(4);
  });

  it("centres the board on the origin", () => {
    const grid = makeGrid({ rows: 3, cols: 5, cellSize: 2 });
    expect(cell(grid, 1, 2).center.toArray()).toEqual([0, 0, 0]);
    expect(cell(grid, 0, 0).center.toArray()).toEqual([-4, 0, -2]);
    expect(cell(grid, 2, 4).center.toArray()).toEqual([4, 0, 2]);
  });

  it("seeds three-cell obstacle runs", () => {
    const grid = makeGrid({ rows: 6, cols: 6 });
    // The first draw seeds a run east from (0,0), the rest draw nothing.
    let draws = 0;
    randomizeObstacles(grid, 0.5, () => (draws++ === 0 ? 0 : 1));
    const obstacles = grid.cells.filter((c) => c.obstacle);
    expect(obstacles.map((c) => [c.row, c.col])).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
  });
});

describe("A* on the grid", () => {
  it("crosses an empty 10x10 corner to corner in 19 adjacent cells", () => {
    const grid = makeGrid();
    const state = runAStar(grid, firstCell(grid), lastCell(grid));
    expect(state.noSolution).toBe(false);
    expect(state.path).toHaveLength(19);
    expect(at(state.path, 0)).toBe(lastCell(grid));
    expect(at(state.path, 18)).toBe(firstCell(grid));
    for (let i = 0; i + 1 < state.path.length; i++) {
      expect(at(state.path, i).neighbors).toContain(at(state.path, i + 1));
    }
  });

  it.each([
    { cellSize: 1, diagonal: false },
    { cellSize: 5, diagonal: false },
    { cellSize: 1, diagonal: true },
    { cellSize: 5, diagonal: true },
  ])(
    "matches the Dijkstra cost with cellSize $cellSize, diagonal $diagonal",
    ({ cellSize, diagonal }) => {
      const empty = makeGrid({ cellSize, diagonal });
      const start = firstCell(empty);
      const target = lastCell(empty);
      const state = runAStar(empty, start, target);
      expect(state.noSolution).toBe(false);
      expect(target.g).toBeCloseTo(shortestCost(empty, start, target));
      expect(target.g).toBeCloseTo(
        diagonal ? 9 * Math.SQRT2 * cellSize : 18 * cellSize
      );

      const cluttered = makeGrid({ cellSize, diagonal });
      randomizeObstacles(cluttered, 0.08, seededRandom(11));
      const from = firstCell(cluttered);
      const to = lastCell(cluttered);
      from.obstacle = false;
      to.obstacle = false;
      const reference = shortestCost(cluttered, from, to);
      const found = runAStar(cluttered, from, to);
      if (found.noSolution) {
        expect(reference).toBe(Infinity);
      } else {
        expect(to.g).toBeCloseTo(reference);
        expect(found.path.some((c) => c.obstacle)).toBe(false);
      }
    }
  );

  it("is forced through the single gap in a wall row", () => {
    const grid = makeGrid();
    for (let col = 0; col < 10; col++) {
      if (col !== 7) cell(grid, 5, col).obstacle = true;
    }
    const state = runAStar(grid, firstCell(grid), lastCell(grid));
    expect(state.noSolution).toBe(false);
    expect(state.path).toContain(cell(grid, 5, 7));
    expect(state.path.some((c) => c.obstacle)).toBe(false);
  });

  it("reports no solution when a full row is blocked", () => {
    const grid = makeGrid();
    for (let col = 0; col < 10; col++) cell(grid, 5, col).obstacle = true;
    const state = runAStar(grid, firstCell(grid), lastCell(grid));
    expect(state.noSolution).toBe(true);
    expect(state.path.length).toBeLessThan(19);
  });
});

describe("maze carving on the grid", () => {
  it("carves a spanning tree whose passages match the open walls", () => {
    const grid = makeGrid({ rows: 8, cols: 9 });
    const hooks = mazeHooks(seededRandom(3));
    const state = startMaze(firstCell(grid));
    let guard = 100_000;
    while (state.running && guard-- > 0) stepMaze(state, hooks);
    expect(state.running).toBe(false);

    expect(grid.cells.every((c) => c.visited)).toBe(true);
    expect(state.carved).toBe(72);
    const passages = grid.cells.reduce((sum, c) => sum + c.passages.length, 0);
    expect(passages).toBe(2 * (72 - 1));

    for (const c of grid.cells) {
      for (const other of c.passages) {
        // Symmetric, cardinal, and the wall is open on both sides.
        expect(other.passages).toContain(c);
        const side = c.sideFacing(other);
        expect(side).not.toBeNull();
        if (side === null) continue;
        expect(c.walls[side]).toBe(false);
        expect(other.walls[OPPOSITE[side]]).toBe(false);
      }
      for (const side of SIDES) {
        const other = c.sideTo[side];
        // Every open wall is a passage; the border stays closed.
        if (!other) expect(c.walls[side]).toBe(true);
        else if (!c.walls[side]) expect(c.passages).toContain(other);
      }
    }
  });

  it("ignores the diagonal toggle", () => {
    const grid = makeGrid({ rows: 6, cols: 6, diagonal: true });
    const hooks = mazeHooks(seededRandom(5));
    const state = startMaze(firstCell(grid));
    let guard = 100_000;
    while (state.running && guard-- > 0) stepMaze(state, hooks);
    for (const c of grid.cells) {
      for (const other of c.passages)
        expect(c.sideFacing(other)).not.toBeNull();
    }
  });
});
