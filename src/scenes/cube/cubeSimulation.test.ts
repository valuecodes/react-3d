import { describe, expect, it } from "vitest";

import { seededRandom } from "../../lib/graph/random";
import { at } from "../../lib/invariant";
import type { SimulationStatus } from "../../lib/statusStore";
import { createPathLine } from "../../three/pathline";
import { createCube } from "./cube";
import type { CubeCell } from "./cube";
import { CubeMeshes } from "./cubeMeshes";
import { CubeSimulation } from "./cubeSimulation";
import type { CubeVariant } from "./cubeSimulation";
import type { CubeOptions } from "./formations";

const BASE: CubeOptions = {
  size: 4,
  cellSize: 2,
  sides: 3,
  obstacles: false,
  fullNeighbors: false,
};

function makeSimulation(
  variant: CubeVariant,
  patch: Partial<CubeOptions> = {},
  seed = 1
) {
  const cube = createCube({ ...BASE, ...patch });
  const meshes = new CubeMeshes(cube, variant !== "astar");
  const pathLine = createPathLine(2 * cube.cells.length, "red");
  const reports: SimulationStatus[] = [];
  const simulation = new CubeSimulation(
    cube,
    meshes,
    pathLine,
    variant,
    seededRandom(seed),
    (status) => reports.push(status)
  );
  const last = () => at(reports, reports.length - 1);
  return { cube, meshes, pathLine, simulation, reports, last };
}

function run(simulation: CubeSimulation, limit = 100_000): number {
  let ticks = 0;
  while (simulation.status().phase === "running" && ticks < limit) {
    simulation.tick();
    ticks++;
  }
  expect(simulation.status().phase).not.toBe("running");
  return ticks;
}

function expectPathBetween(
  path: readonly CubeCell[],
  start: CubeCell,
  target: CubeCell,
  linked: (a: CubeCell, b: CubeCell) => boolean
): void {
  expect(path.length).toBeGreaterThan(1);
  expect(at(path, 0)).toBe(target);
  expect(at(path, path.length - 1)).toBe(start);
  for (let i = 0; i + 1 < path.length; i++) {
    expect(linked(at(path, i), at(path, i + 1))).toBe(true);
  }
}

describe("CubeSimulation", () => {
  it("starts idle with markers placed and Start enabled", () => {
    const { simulation, cube } = makeSimulation("maze");
    const status = simulation.status();
    expect(status.phase).toBe("idle");
    expect(status.canStart).toBe(true);
    expect(simulation.startCell).toBe(at(cube.cells, 0));
    expect(simulation.startCell.start).toBe(true);
    expect(simulation.targetCell.target).toBe(true);
    expect(simulation.targetCell.id).toBeGreaterThanOrEqual(
      Math.floor(cube.cells.length / 2)
    );
    expect(simulation.activeFace).toBe("top");
  });

  it("maze: carves a spanning maze and reports progress to done", () => {
    const { simulation, cube, last } = makeSimulation("maze");
    simulation.start();
    expect(last().phase).toBe("running");
    expect(simulation.stage).toBe("maze");
    simulation.tick();
    expect(last().progress).toBeGreaterThan(0);
    run(simulation);
    expect(last().phase).toBe("done");
    expect(last().progress).toBe(1);
    expect(last().message).toBe("Maze ready");
    expect(cube.cells.every((cell) => cell.visited)).toBe(true);
    const passages = cube.cells.reduce(
      (n, cell) => n + cell.passages.length,
      0
    );
    expect(passages).toBe(2 * (cube.cells.length - 1));
    expect(simulation.trackerActive()).toBe(false);
  });

  it("astar: searches, walks the path, then reports done", () => {
    const { simulation, cube, last } = makeSimulation("astar", {
      obstacles: true,
      fullNeighbors: true,
    });
    expect(cube.cells.some((cell) => cell.obstacle)).toBe(true);
    simulation.start();
    expect(simulation.stage).toBe("astar");
    const stages = new Set<string>();
    while (simulation.status().phase === "running") {
      stages.add(simulation.stage);
      simulation.tick();
    }
    expect([...stages]).toEqual(["astar", "tracking"]);
    expect(last().phase).toBe("done");
    expect(last().message).toBe("Path found");
    expect(last().progress).toBe(1);
    expect(simulation.trackerActive()).toBe(true);
    expect(simulation.cursor.done).toBe(true);

    const { astar } = simulation;
    expect(astar).not.toBeNull();
    if (!astar) return;
    expectPathBetween(
      astar.path,
      simulation.startCell,
      simulation.targetCell,
      (a, b) => a.neighbors.includes(b) && !a.obstacle && !b.obstacle
    );
    expect(simulation.linePoints.length).toBeGreaterThanOrEqual(
      astar.path.length
    );
    expect(last().details.map((d) => d.label)).toContain("Path length");
  });

  it("mazePathfinder: carves, searches through passages only, then tracks", () => {
    const { simulation, cube, last } = makeSimulation("mazePathfinder");
    simulation.start();
    const stages: string[] = [];
    while (simulation.status().phase === "running") {
      if (stages[stages.length - 1] !== simulation.stage)
        stages.push(simulation.stage);
      simulation.tick();
    }
    expect(stages).toEqual(["maze", "astar", "tracking"]);
    expect(last().phase).toBe("done");
    expect(cube.cells.every((cell) => cell.visited)).toBe(true);
    const { astar } = simulation;
    expect(astar).not.toBeNull();
    if (!astar) return;
    expectPathBetween(
      astar.path,
      simulation.startCell,
      simulation.targetCell,
      (a, b) => a.passages.includes(b)
    );
  });

  it("holds while paused and resumes with a fresh run after an edit", () => {
    const { simulation, cube, last } = makeSimulation("astar");
    simulation.start();
    for (let i = 0; i < 3; i++) simulation.tick();
    simulation.pause();
    expect(simulation.paused).toBe(true);
    expect(last().phase).toBe("paused");
    const closedBefore = simulation.astar?.closedSet.length ?? -1;
    simulation.tick();
    expect(simulation.astar?.closedSet.length).toBe(closedBefore);
    expect(last().phase).toBe("paused");

    // An edit while paused starts over, unpaused.
    const newStart = at(cube.cells, 5);
    simulation.setStart(newStart);
    expect(simulation.paused).toBe(false);
    expect(simulation.startCell).toBe(newStart);
    expect(at(cube.cells, 0).start).toBe(false);
    expect(last().phase).toBe("running");
    expect(simulation.astar?.closedSet).toHaveLength(0);
    run(simulation);
    expect(last().phase).toBe("done");
    expect(simulation.astar?.start).toBe(newStart);

    // Resume also clears the flag.
    simulation.start();
    simulation.pause();
    simulation.resume();
    expect(last().phase).toBe("running");
  });

  it("re-searches a carved maze when the target moves after it is done", () => {
    const { simulation, cube, last } = makeSimulation("mazePathfinder");
    simulation.start();
    run(simulation);
    expect(last().phase).toBe("done");
    const passagesBefore = cube.cells.map((cell) => [...cell.passages]);
    const newTarget = at(cube.cells, 7);
    simulation.setTarget(newTarget);
    expect(simulation.stage).toBe("astar");
    expect(cube.cells.map((cell) => [...cell.passages])).toEqual(
      passagesBefore
    );
    run(simulation);
    expect(last().phase).toBe("done");
    expect(simulation.astar?.target).toBe(newTarget);
  });

  it("ignores moving a marker onto the other marker", () => {
    const { simulation } = makeSimulation("astar");
    const { startCell, targetCell } = simulation;
    expect(simulation.setStart(targetCell)).toBe(false);
    expect(simulation.setTarget(startCell)).toBe(false);
    expect(simulation.startCell).toBe(startCell);
    expect(simulation.targetCell).toBe(targetCell);
  });

  it("moving a marker while idle stays idle", () => {
    const { simulation, cube, last } = makeSimulation("maze");
    expect(simulation.setStart(at(cube.cells, 9))).toBe(true);
    expect(last().phase).toBe("idle");
    expect(simulation.startCell).toBe(at(cube.cells, 9));
  });

  it("reports failed when the target is walled in", () => {
    const { simulation, last } = makeSimulation("astar");
    for (const neighbor of simulation.targetCell.neighbors) {
      neighbor.obstacle = true;
    }
    simulation.start();
    run(simulation);
    expect(last().phase).toBe("failed");
    expect(last().message).toBe("No path found");
    expect(simulation.trackerActive()).toBe(false);
  });

  it("reset returns to idle and a rerun completes again", () => {
    const { simulation, cube, last } = makeSimulation("mazePathfinder");
    simulation.start();
    for (let i = 0; i < 10; i++) simulation.tick();
    simulation.reset();
    expect(last().phase).toBe("idle");
    expect(simulation.stage).toBe("idle");
    expect(simulation.linePoints).toHaveLength(0);
    expect(simulation.pathLine.object.geometry.drawRange.count).toBe(0);
    for (const cell of cube.cells) {
      expect(cell.visited).toBe(false);
      expect(cell.walls).toEqual([true, true, true, true]);
    }
    expect(simulation.startCell.start).toBe(true);
    expect(simulation.targetCell.target).toBe(true);

    simulation.start();
    run(simulation);
    expect(last().phase).toBe("done");
  });

  it("tracks the active face through the walk", () => {
    const { simulation, cube } = makeSimulation("astar", {
      sides: 6,
      fullNeighbors: true,
    });
    const bot = at(cube.faces, 5);
    simulation.setTarget(at(bot.cells, bot.cells.length - 1));
    simulation.start();
    const faces = new Set<string>();
    while (simulation.status().phase === "running") {
      simulation.tick();
      if (simulation.stage === "tracking") faces.add(simulation.activeFace);
    }
    expect(faces.has("bot")).toBe(true);
    expect(simulation.activeFace).toBe("bot");
  });
});
