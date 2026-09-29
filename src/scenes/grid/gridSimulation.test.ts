import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { seededRandom } from "../../lib/graph/random";
import { at } from "../../lib/invariant";
import type { SimulationStatus } from "../../lib/statusStore";
import { createPathLine } from "../../three/pathline";
import { createGrid, defaultGridOptions } from "./grid";
import type { GridCell, GridOptions, GridVariant } from "./grid";
import { createGridMeshes, GRID_SCHEMES, wallSlot } from "./gridMeshes";
import { GridSimulation } from "./gridSimulation";

function makeSimulation(
  variant: GridVariant,
  patch: Partial<GridOptions> = {},
  seed = 1
) {
  const random = seededRandom(seed);
  const options = {
    ...defaultGridOptions(variant),
    rows: 8,
    cols: 8,
    ...patch,
  };
  const grid = createGrid(options, random);
  const meshes = createGridMeshes(grid, GRID_SCHEMES[variant], {
    walls: variant !== "astar",
  });
  const pathLine = createPathLine(grid.cells.length, "red");
  const reports: SimulationStatus[] = [];
  const simulation = new GridSimulation(
    variant,
    grid,
    meshes,
    pathLine,
    (status) => reports.push(status),
    random
  );
  const last = () => at(reports, reports.length - 1);
  return { simulation, grid, meshes, reports, last };
}

function run(simulation: GridSimulation, limit = 200_000): number {
  let ticks = 0;
  while (simulation.status().phase === "running" && ticks < limit) {
    simulation.tick();
    ticks++;
  }
  expect(simulation.status().phase).not.toBe("running");
  return ticks;
}

function cellAt(simulation: GridSimulation, row: number, col: number) {
  const found = simulation.grid.cellAt(row, col);
  if (!found) throw new Error(`No cell at ${row},${col}`);
  return found;
}

function expectPathFromStartToTarget(
  path: readonly GridCell[],
  start: GridCell,
  target: GridCell
) {
  expect(path.length).toBeGreaterThan(1);
  expect(at(path, 0)).toBe(target);
  expect(at(path, path.length - 1)).toBe(start);
}

describe("GridSimulation", () => {
  it("starts with the corner markers and reports idle", () => {
    const { simulation, grid, reports } = makeSimulation("astar");
    expect(simulation.startCell).toBe(at(grid.cells, 0));
    expect(simulation.targetCell).toBe(at(grid.cells, grid.cells.length - 1));
    expect(simulation.startCell.obstacle).toBe(false);
    expect(simulation.targetCell.obstacle).toBe(false);
    // The provider reports on mount; construction itself is silent.
    expect(reports).toHaveLength(0);
    const status = simulation.status();
    expect(status.phase).toBe("idle");
    expect(status.canStart).toBe(true);
    expect(status.message).toBe("Start runs the search");
  });

  it("astar: searches, tracks the path and reports done", () => {
    const { simulation, last } = makeSimulation("astar", { wallChance: 0 });
    simulation.start();
    expect(simulation.stage).toBe("astar");
    expect(last().phase).toBe("running");

    run(simulation);
    expect(simulation.stage).toBe("done");
    expect(last().phase).toBe("done");
    expect(last().progress).toBe(1);
    expect(last().message).toBe("Path tracked");
    expect(simulation.showTracker()).toBe(true);
    expect(simulation.cursor.progress).toBe(1);
    const state = simulation.astar;
    expect(state).not.toBeNull();
    if (!state) return;
    expectPathFromStartToTarget(
      state.path,
      simulation.startCell,
      simulation.targetCell
    );
    expect(state.path).toHaveLength(15);
    expect(last().details.find((d) => d.label === "Path length")?.value).toBe(
      "15"
    );
    // The tracker ends on the target.
    const position = simulation.cursor.position(new Vector3());
    expect(position.distanceTo(simulation.targetCell.center)).toBeCloseTo(0);
  });

  it("astar: routes around obstacles and fails when the target is walled in", () => {
    const { simulation, last } = makeSimulation("astar", { wallChance: 0 });
    for (let col = 0; col < 8; col++) {
      if (col !== 3) simulation.paintObstacle(cellAt(simulation, 4, col));
    }
    // Painting while idle stays idle.
    expect(last().phase).toBe("idle");
    simulation.start();
    run(simulation);
    expect(simulation.stage).toBe("done");
    expect(simulation.astar?.path).toContain(cellAt(simulation, 4, 3));

    // Sealing the gap while done restarts the search, which now fails.
    simulation.paintObstacle(cellAt(simulation, 4, 3));
    expect(last().phase).toBe("running");
    run(simulation);
    expect(simulation.stage).toBe("failed");
    expect(last().phase).toBe("failed");
    expect(last().message).toBe("No path found");
    expect(simulation.showTracker()).toBe(false);

    simulation.setObstacles("clear");
    expect(simulation.grid.cells.some((c) => c.obstacle)).toBe(false);
    expect(last().phase).toBe("running");
    run(simulation);
    expect(last().phase).toBe("done");
  });

  it("maze: carves every cell and reports done with progress 1", () => {
    const { simulation, grid, meshes, last } = makeSimulation("maze");
    simulation.start();
    expect(last().phase).toBe("running");
    expect(last().message).toBe("Carving the maze");
    simulation.tick();
    expect(last().progress).toBeGreaterThan(0);
    expect(last().progress).toBeLessThan(1);

    run(simulation);
    expect(simulation.stage).toBe("done");
    expect(last().phase).toBe("done");
    expect(last().progress).toBe(1);
    expect(last().message).toBe("Maze ready");
    expect(grid.cells.every((c) => c.visited)).toBe(true);
    const passages = grid.cells.reduce((sum, c) => sum + c.passages.length, 0);
    expect(passages).toBe(2 * (grid.cells.length - 1));
    expect(simulation.showTracker()).toBe(false);

    // Open passages have their shared wall instance collapsed to zero scale.
    const walls = meshes.walls;
    expect(walls).not.toBeNull();
    if (!walls) return;
    const matrix = new Float32Array(16);
    const first = at(grid.cells, 0);
    const through = at(first.passages, 0);
    const side = first.sideFacing(through);
    expect(side).not.toBeNull();
    if (side === null) return;
    const slot = wallSlot(grid, first, side);
    matrix.set(walls.instanceMatrix.array.subarray(slot * 16, slot * 16 + 16));
    expect(matrix[0]).toBe(0);
    expect(matrix[5]).toBe(0);
    expect(matrix[10]).toBe(0);
  });

  it("mazePathfinder: carves, searches through passages, tracks and finishes", () => {
    const { simulation, grid, last } = makeSimulation("mazePathfinder");
    const stages = new Set<string>();
    simulation.start();
    expect(simulation.stage).toBe("maze");
    let guard = 200_000;
    while (simulation.status().phase === "running" && guard-- > 0) {
      stages.add(simulation.stage);
      simulation.tick();
    }
    expect([...stages]).toEqual(["maze", "astar", "tracking"]);
    expect(simulation.stage).toBe("done");
    expect(last().phase).toBe("done");
    expect(last().progress).toBe(1);

    const state = simulation.astar;
    expect(state).not.toBeNull();
    if (!state) return;
    expect(state.noSolution).toBe(false);
    expectPathFromStartToTarget(
      state.path,
      simulation.startCell,
      simulation.targetCell
    );
    for (let i = 0; i + 1 < state.path.length; i++) {
      expect(at(state.path, i).passages).toContain(at(state.path, i + 1));
    }
    expect(grid.cells.every((c) => c.visited)).toBe(true);
  });

  it("pauses, holds across ticks, and an edit resumes with a fresh run", () => {
    const { simulation, last } = makeSimulation("astar", { wallChance: 0 });
    simulation.start();
    simulation.tick();
    simulation.tick();
    simulation.pause();
    expect(simulation.paused).toBe(true);
    expect(last().phase).toBe("paused");
    expect(last().message).toBe("Paused");
    const closedBefore = simulation.astar?.closedSet.length ?? 0;
    simulation.tick();
    expect(simulation.astar?.closedSet.length).toBe(closedBefore);
    expect(last().phase).toBe("paused");

    simulation.setStart(cellAt(simulation, 2, 2));
    expect(simulation.paused).toBe(false);
    expect(last().phase).toBe("running");
    expect(simulation.astar?.closedSet).toHaveLength(0);
    expect(simulation.startCell).toBe(cellAt(simulation, 2, 2));
    expect(cellAt(simulation, 0, 0).start).toBe(false);

    simulation.pause();
    simulation.resume();
    expect(last().phase).toBe("running");
    run(simulation);
    expect(last().phase).toBe("done");
    expect(
      at(simulation.astar?.path ?? [], (simulation.astar?.path.length ?? 1) - 1)
    ).toBe(cellAt(simulation, 2, 2));
  });

  it("refuses markers on each other or on obstacles", () => {
    const { simulation } = makeSimulation("astar", { wallChance: 0 });
    const target = simulation.targetCell;
    simulation.setStart(target);
    expect(simulation.startCell).not.toBe(target);
    const blocked = cellAt(simulation, 3, 3);
    simulation.paintObstacle(blocked);
    simulation.setTarget(blocked);
    expect(simulation.targetCell).toBe(target);
    simulation.paintObstacle(simulation.startCell);
    expect(simulation.startCell.obstacle).toBe(false);
  });

  it("resets to idle and can run again", () => {
    const { simulation, grid, last } = makeSimulation("mazePathfinder");
    simulation.start();
    run(simulation);
    expect(last().phase).toBe("done");

    simulation.reset();
    expect(simulation.stage).toBe("idle");
    expect(last().phase).toBe("idle");
    expect(last().progress).toBeNull();
    expect(simulation.astar).toBeNull();
    expect(grid.cells.every((c) => !c.visited && c.passages.length === 0)).toBe(
      true
    );
    expect(grid.cells.every((c) => c.walls.every(Boolean))).toBe(true);
    expect(simulation.cursor.done).toBe(true);
    expect(simulation.showTracker()).toBe(false);

    simulation.start();
    run(simulation);
    expect(last().phase).toBe("done");
    expect(simulation.astar?.noSolution).toBe(false);
  });

  it("astar: honours the diagonal toggle", () => {
    const { simulation } = makeSimulation("astar", {
      wallChance: 0,
      diagonal: true,
    });
    simulation.start();
    run(simulation);
    expect(simulation.astar?.path).toHaveLength(8);
  });
});
