import { Matrix4, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { startAStar, stepAStar } from "../../lib/graph/aStar";
import type { AStarHooks } from "../../lib/graph/aStar";
import { euclidean } from "../../lib/graph/graphNode";
import { startMaze, stepMaze } from "../../lib/graph/mazeBacktracker";
import { seededRandom } from "../../lib/graph/random";
import { at } from "../../lib/invariant";
import { createPathLine } from "../../three/pathline";
import { createCube, pathPoints, removeWallsBetween, resetRun } from "./cube";
import type { Cube, CubeCell } from "./cube";
import { CubeMeshes, wallSlot, wallSlotCount } from "./cubeMeshes";
import { FACES, halfSide, pathLift } from "./formations";
import type { CubeOptions } from "./formations";

const SIZE = 4;
const CELL = 2;
const H = halfSide(SIZE, CELL);
const LIFT = pathLift(CELL);

function options(patch: Partial<CubeOptions> = {}): CubeOptions {
  return {
    size: SIZE,
    cellSize: CELL,
    sides: 6,
    obstacles: false,
    fullNeighbors: false,
    ...patch,
  };
}

function crossLinkCount(cube: Cube): number {
  let links = 0;
  for (const cell of cube.cells) links += cell.crossLinks.length;
  return links / 2;
}

/** Carves a whole maze with the seeded backtracker. */
function carve(cube: Cube, seed: number): void {
  const state = startMaze(at(cube.cells, 0));
  const hooks = {
    unvisitedNeighbors: (cell: CubeCell) =>
      cell.sideTo.filter(
        (next): next is CubeCell => next !== null && !next.visited
      ),
    removeWallsBetween,
    random: seededRandom(seed),
  };
  let guard = 0;
  while (state.running && guard++ < 1_000_000) stepMaze(state, hooks);
  expect(state.running).toBe(false);
}

function search(
  cube: Cube,
  start: CubeCell,
  target: CubeCell,
  hooks: AStarHooks<CubeCell>
) {
  const state = startAStar(cube.cells, start, target, hooks);
  let guard = 0;
  while (state.running && guard++ < 1_000_000) stepAStar(state, hooks);
  return state;
}

/** Shortest path cost by Dijkstra over the same hooks, for comparison. */
function dijkstra(
  cube: Cube,
  start: CubeCell,
  target: CubeCell,
  hooks: AStarHooks<CubeCell>
): number {
  const cost = hooks.cost ?? hooks.heuristic;
  const distance = new Map<CubeCell, number>([[start, 0]]);
  const pending = new Set<CubeCell>([start]);
  while (pending.size > 0) {
    let best: CubeCell | null = null;
    for (const cell of pending) {
      if (!best || (distance.get(cell) ?? 0) < (distance.get(best) ?? 0))
        best = cell;
    }
    if (!best) break;
    pending.delete(best);
    if (best === target) break;
    const base = distance.get(best) ?? 0;
    for (const next of hooks.neighborsOf(best)) {
      const tentative = base + cost(best, next);
      const known = distance.get(next);
      if (known === undefined || tentative < known) {
        distance.set(next, tentative);
        pending.add(next);
      }
    }
  }
  return distance.get(target) ?? Number.POSITIVE_INFINITY;
}

function pathCost(path: readonly CubeCell[], hooks: AStarHooks<CubeCell>) {
  const cost = hooks.cost ?? hooks.heuristic;
  let sum = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    sum += cost(at(path, i), at(path, i + 1));
  }
  return sum;
}

const openHooks: AStarHooks<CubeCell> = {
  neighborsOf: (cell) => cell.neighbors.filter((next) => !next.obstacle),
  heuristic: euclidean,
  cost: euclidean,
};

const passageHooks: AStarHooks<CubeCell> = {
  neighborsOf: (cell) => cell.passages,
  heuristic: euclidean,
  cost: euclidean,
};

describe("createCube", () => {
  it("gives every cell of a six-sided cube exactly four side neighbours", () => {
    const cube = createCube(options());
    expect(cube.faces).toHaveLength(6);
    expect(cube.cells).toHaveLength(6 * SIZE * SIZE);
    for (const cell of cube.cells) {
      expect(cell.sideTo.filter((n) => n !== null)).toHaveLength(4);
      expect(cell.neighbors).toHaveLength(4);
    }
  });

  it("links symmetrically, by side and by neighbour list", () => {
    const cube = createCube(options({ fullNeighbors: true }));
    for (const cell of cube.cells) {
      cell.sideTo.forEach((neighbor, side) => {
        if (!neighbor) return;
        expect(cell.sideFacing(neighbor)).toBe(side);
        const back = neighbor.sideFacing(cell);
        expect(back).not.toBeNull();
        expect(neighbor.sideTo[back ?? 0]).toBe(cell);
      });
      for (const neighbor of cell.neighbors) {
        expect(neighbor.neighbors).toContain(cell);
      }
      expect(new Set(cell.neighbors).size).toBe(cell.neighbors.length);
    }
  });

  it("matches 12·size cross-face links on six faces and 3·size on three", () => {
    expect(crossLinkCount(createCube(options()))).toBe(12 * SIZE);
    const corner = createCube(options({ sides: 3 }));
    expect(corner.faces.map((face) => face.name)).toEqual([
      "top",
      "front",
      "right",
    ]);
    expect(crossLinkCount(corner)).toBe(3 * SIZE);
    const open = corner.cells.filter((cell) => cell.sideTo.includes(null));
    expect(open.length).toBeGreaterThan(0);
  });

  it("cross-face partners touch: their centres are a half diagonal apart", () => {
    const cube = createCube(options());
    for (const cell of cube.cells) {
      for (const partner of cell.crossLinks) {
        expect(partner.face).not.toBe(cell.face);
        expect(cell.center.distanceTo(partner.center)).toBeCloseTo(
          CELL / Math.SQRT2
        );
      }
    }
  });

  it("adds the four in-face diagonals with fullNeighbors", () => {
    const cube = createCube(options({ fullNeighbors: true }));
    const inner = at(at(cube.faces, 0).cells, 1 * SIZE + 1);
    expect(inner.neighbors).toHaveLength(8);
    expect(inner.crossLinks).toHaveLength(0);
    const corner = at(at(cube.faces, 0).cells, 0);
    // Two in-face sides, one diagonal, two cross-face partners.
    expect(corner.neighbors).toHaveLength(5);
    expect(corner.crossLinks).toHaveLength(2);
  });
});

describe("maze on the cube", () => {
  it("spans every cell with cells - 1 passages and crosses faces", () => {
    const cube = createCube(options());
    carve(cube, 7);
    expect(cube.cells.every((cell) => cell.visited)).toBe(true);
    let passages = 0;
    let crossings = 0;
    for (const cell of cube.cells) {
      passages += cell.passages.length;
      crossings += cell.passages.filter((p) => p.face !== cell.face).length;
    }
    expect(passages).toBe(2 * (cube.cells.length - 1));
    expect(crossings).toBeGreaterThan(0);
  });

  it("keeps seams consistent on both faces", () => {
    const cube = createCube(options({ sides: 3 }));
    carve(cube, 11);
    for (const cell of cube.cells) {
      cell.sideTo.forEach((neighbor, side) => {
        const wall = cell.walls[side] ?? true;
        if (!neighbor) {
          // Unmatched borders (the missing faces) stay closed.
          expect(wall).toBe(true);
          return;
        }
        const back = neighbor.sideFacing(cell) ?? 0;
        expect(neighbor.walls[back]).toBe(wall);
        expect(cell.passages.includes(neighbor)).toBe(!wall);
        expect(neighbor.passages.includes(cell)).toBe(!wall);
      });
    }
  });

  it("resetRun closes every wall again", () => {
    const cube = createCube(options());
    carve(cube, 3);
    resetRun(cube);
    for (const cell of cube.cells) {
      expect(cell.walls).toEqual([true, true, true, true]);
      expect(cell.passages).toHaveLength(0);
      expect(cell.visited).toBe(false);
    }
  });
});

describe("A* on the cube", () => {
  it("finds an optimal connected path from top to bot over open cells", () => {
    const cube = createCube(options({ fullNeighbors: true }));
    const start = at(at(cube.faces, 0).cells, 0);
    const bot = at(cube.faces, 5);
    const target = at(bot.cells, bot.cells.length - 1);
    const state = search(cube, start, target, openHooks);
    expect(state.noSolution).toBe(false);
    const { path } = state;
    expect(at(path, 0)).toBe(target);
    expect(at(path, path.length - 1)).toBe(start);
    for (let i = 0; i + 1 < path.length; i++) {
      expect(at(path, i).neighbors).toContain(at(path, i + 1));
    }
    expect(pathCost(path, openHooks)).toBeCloseTo(
      dijkstra(cube, start, target, openHooks)
    );
    expect(path.some((cell) => cell.face === "bot")).toBe(true);
    expect(path.some((cell) => cell.face === "top")).toBe(true);
  });

  it("only walks through carved passages", () => {
    const cube = createCube(options());
    carve(cube, 5);
    const start = at(cube.cells, 0);
    const target = at(cube.cells, cube.cells.length - 1);
    const state = search(cube, start, target, passageHooks);
    expect(state.noSolution).toBe(false);
    const { path } = state;
    for (let i = 0; i + 1 < path.length; i++) {
      expect(at(path, i).passages).toContain(at(path, i + 1));
    }
    expect(pathCost(path, passageHooks)).toBeCloseTo(
      dijkstra(cube, start, target, passageHooks)
    );
  });
});

describe("pathPoints", () => {
  it("never truncates a cross-face path and lifts every point off a face", () => {
    const cube = createCube(options());
    const start = at(at(cube.faces, 0).cells, 0);
    const bot = at(cube.faces, 5);
    const target = at(bot.cells, bot.cells.length - 1);
    const { path } = search(cube, start, target, openHooks);
    const cells = [...path].reverse();
    const points = pathPoints(cube, cells);

    let crossings = 0;
    for (let i = 0; i + 1 < cells.length; i++) {
      if (at(cells, i).face !== at(cells, i + 1).face) crossings++;
    }
    expect(crossings).toBeGreaterThan(0);
    expect(points).toHaveLength(cells.length + crossings);

    const line = createPathLine(2 * cube.cells.length, "red");
    line.setPath(points);
    expect(line.object.geometry.drawRange.count).toBe(points.length);

    for (const point of points) {
      const normal = FACES[point.cell.face].normal;
      expect(point.center.dot(normal)).toBeCloseTo(H + LIFT, 10);
      if (point.partner) {
        const other = FACES[point.partner.face].normal;
        expect(point.center.dot(other)).toBeCloseTo(H + LIFT, 10);
      }
    }
  });

  it("does not insert edge points on a single face", () => {
    const cube = createCube(options());
    const face = at(cube.faces, 0);
    const cells = [at(face.cells, 0), at(face.cells, 1), at(face.cells, 2)];
    expect(pathPoints(cube, cells)).toHaveLength(3);
  });
});

describe("wall slots", () => {
  it("gives each face 2·size·(size+1) slots shared between side neighbours", () => {
    const count = wallSlotCount(SIZE);
    expect(count).toBe(2 * SIZE * (SIZE + 1));
    const used = new Set<number>();
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        for (let side = 0; side < 4; side++) {
          const slot = wallSlot(SIZE, x, y, side);
          expect(slot).toBeGreaterThanOrEqual(0);
          expect(slot).toBeLessThan(count);
          used.add(slot);
        }
        if (x + 1 < SIZE) {
          expect(wallSlot(SIZE, x, y, 1)).toBe(wallSlot(SIZE, x + 1, y, 3));
        }
        if (y + 1 < SIZE) {
          expect(wallSlot(SIZE, x, y, 2)).toBe(wallSlot(SIZE, x, y + 1, 0));
        }
      }
    }
    expect(used.size).toBe(count);
  });
});

describe("CubeMeshes", () => {
  it("maps path points to the folded centres while in cube formation", () => {
    const cube = createCube(options());
    const meshes = new CubeMeshes(cube, true);
    const start = at(at(cube.faces, 0).cells, 0);
    const bot = at(cube.faces, 5);
    const target = at(bot.cells, bot.cells.length - 1);
    const { path } = search(cube, start, target, openHooks);
    const points = pathPoints(cube, [...path].reverse());
    const out = new Vector3();
    for (const point of points) {
      meshes.pathPointRootLocal(point, out);
      expect(out.distanceTo(point.center)).toBeLessThan(1e-9);
    }
    meshes.dispose();
  });

  it("places the tracker exactly on cross-face path points", () => {
    const cube = createCube(options());
    const meshes = new CubeMeshes(cube, true);
    const start = at(at(cube.faces, 0).cells, 0);
    const bot = at(cube.faces, 5);
    const target = at(bot.cells, bot.cells.length - 1);
    const { path } = search(cube, start, target, openHooks);
    const points = pathPoints(cube, [...path].reverse());
    const crossing = points.findIndex((point) => point.partner !== null);
    expect(crossing).toBeGreaterThan(0);
    const expected = at(meshes.rootLocalPoints(points), crossing).center;
    // A hidden tracker snaps straight to its goal, so the goal is observable.
    meshes.tracker.visible = false;
    const last = points.length - 1;
    meshes.updateTracker(points, crossing / last, 1 / 60);
    expect(meshes.tracker.position.distanceTo(expected)).toBeLessThan(1e-9);
    // Halfway toward the crossing from the previous point.
    meshes.tracker.visible = false;
    const before = at(meshes.rootLocalPoints(points), crossing - 1).center;
    meshes.updateTracker(points, (crossing - 0.5) / last, 1 / 60);
    const midpoint = before.clone().lerp(expected, 0.5);
    expect(meshes.tracker.position.distanceTo(midpoint)).toBeLessThan(1e-9);
    meshes.dispose();
  });

  it("animates faces from the cube to the net and back", () => {
    const cube = createCube(options());
    const meshes = new CubeMeshes(cube, true);
    expect(meshes.animateFormation("cube", 1 / 60)).toBe(false);
    let frames = 0;
    while (meshes.animateFormation("net", 1 / 60) && frames < 10_000) frames++;
    expect(frames).toBeGreaterThan(0);
    for (const face of meshes.faces) {
      expect(face.group.position.equals(face.targets.net.position)).toBe(true);
      expect(face.group.position.y).toBe(H);
    }
    while (meshes.animateFormation("cube", 1 / 60) && frames < 20_000) frames++;
    for (const face of meshes.faces) {
      expect(face.group.position.equals(face.targets.cube.position)).toBe(true);
    }
    meshes.dispose();
  });

  it("opens a cross-face passage on both faces' wall meshes", () => {
    const cube = createCube(options());
    const meshes = new CubeMeshes(cube, true);
    const a = at(cube.cells, 0);
    const b = at(a.crossLinks, 0);
    removeWallsBetween(a, b);
    meshes.syncWalls(a);
    meshes.syncWalls(b);
    const matrix = new Matrix4();
    /** Length of the slot matrix's first column: the wall's x scale. */
    const scaleOf = (cell: CubeCell, side: number): number => {
      const wallMesh = meshes.faceOf(cell).wallMesh;
      if (!wallMesh) throw new Error("expected a wall mesh");
      wallMesh.getMatrixAt(wallSlot(SIZE, cell.x, cell.y, side), matrix);
      const [e0 = 0, e1 = 0, e2 = 0] = matrix.elements;
      return Math.hypot(e0, e1, e2);
    };
    for (const cell of [a, b]) {
      const other = cell === a ? b : a;
      const side = cell.sideFacing(other);
      expect(side).not.toBeNull();
      expect(cell.face).not.toBe(other.face);
      // The opened slot collapses to zero scale; the other three stay closed.
      expect(scaleOf(cell, side ?? 0)).toBe(0);
      for (let k = 0; k < 4; k++) {
        if (k === side) continue;
        expect(scaleOf(cell, k)).toBeGreaterThan(0);
      }
    }
    meshes.dispose();
  });
});
