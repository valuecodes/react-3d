import { describe, expect, it } from "vitest";

import { initialOptions } from "../../../../../../context/options";
import type { SphereOptions } from "../../../../../../context/options";
import { at } from "../../../../../../lib/invariant";
import { createHexasphere } from "./hexasphere";
import { createPathLine } from "./pathline";
import { Simulation } from "./simulation";
import type { Tile } from "./tile";

const DETAIL = 2;
const options: SphereOptions = { ...initialOptions.sphere, detail: DETAIL };

function makeSimulation(): Simulation {
  const hexasphere = createHexasphere(options);
  return new Simulation(
    hexasphere,
    createPathLine(hexasphere.tiles.length, "black"),
    DETAIL
  );
}

function run(
  simulation: Simulation,
  isRunning: () => boolean,
  limit = 100_000
): number {
  let ticks = 0;
  while (isRunning() && ticks < limit) {
    simulation.tick();
    ticks++;
  }
  expect(isRunning()).toBe(false);
  return ticks;
}

function expectConnectedPath(
  path: readonly Tile[],
  start: Tile,
  target: Tile
): void {
  expect(path.length).toBeGreaterThan(1);
  expect(at(path, 0)).toBe(target);
  expect(at(path, path.length - 1)).toBe(start);
  for (let i = 0; i + 1 < path.length; i++) {
    expect(at(path, i).neighbors).toContain(at(path, i + 1));
  }
}

describe("Simulation", () => {
  it("Maze Creator carves a spanning tree and can be regenerated after reset", () => {
    const simulation = makeSimulation();
    simulation.setAlgorithm("Maze Creator");
    for (let round = 0; round < 2; round++) {
      simulation.start();
      expect(simulation.maze.running).toBe(true);
      run(simulation, () => simulation.maze.running);

      const { tiles } = simulation.hexasphere;
      expect(tiles.every((tile) => tile.visited)).toBe(true);
      const openWalls = tiles.reduce(
        (sum, tile) => sum + tile.wallOpen.filter(Boolean).length,
        0
      );
      expect(openWalls).toBe(2 * (tiles.length - 1));
      const passages = tiles.reduce(
        (sum, tile) => sum + tile.availableNeighbors.length,
        0
      );
      expect(passages).toBe(2 * (tiles.length - 1));
    }
  });

  it("Pathfinder finds a path around obstacles", () => {
    const simulation = makeSimulation();
    const { tiles } = simulation.hexasphere;
    simulation.setAlgorithm("Pathfinder");
    const start = at(tiles, 0);
    const target = at(tiles, tiles.length - 1);
    for (const neighbor of start.neighbors.slice(0, 2))
      simulation.paintObstacle(neighbor);

    simulation.setStart(start);
    expect(simulation.astar.running).toBe(false);
    simulation.setTarget(target);
    expect(simulation.astar.running).toBe(true);

    run(simulation, () => simulation.astar.running);
    expect(simulation.astar.noSolution).toBe(false);
    expectConnectedPath(simulation.astar.path, start, target);
    expect(simulation.astar.path.some((tile) => tile.obstacle)).toBe(false);
  });

  it("Pathfinder reports no solution when the target is walled in", () => {
    const simulation = makeSimulation();
    const { tiles } = simulation.hexasphere;
    simulation.setAlgorithm("Pathfinder");
    const target = at(tiles, tiles.length - 1);
    for (const neighbor of target.neighbors) simulation.paintObstacle(neighbor);
    simulation.setStart(at(tiles, 0));
    simulation.setTarget(target);
    run(simulation, () => simulation.astar.running);
    expect(simulation.astar.noSolution).toBe(true);
  });

  it("Maze Pathfinder only walks through open passages", () => {
    const simulation = makeSimulation();
    const { tiles } = simulation.hexasphere;
    simulation.setAlgorithm("Maze Pathfinder");
    const start = at(tiles, 0);
    const target = at(tiles, tiles.length - 1);
    simulation.setStart(start);
    simulation.setTarget(target);
    run(simulation, () => simulation.astar.running);

    expect(simulation.astar.noSolution).toBe(false);
    expectConnectedPath(simulation.astar.path, start, target);
    const { path } = simulation.astar;
    for (let i = 0; i + 1 < path.length; i++) {
      expect(at(path, i).availableNeighbors).toContain(at(path, i + 1));
    }
  });

  it("reset stops the search and clears markers", () => {
    const simulation = makeSimulation();
    const { tiles } = simulation.hexasphere;
    simulation.setAlgorithm("Pathfinder");
    simulation.setStart(at(tiles, 0));
    simulation.setTarget(at(tiles, 5));
    simulation.tick();
    simulation.reset();
    expect(simulation.astar.running).toBe(false);
    expect(simulation.astar.path).toHaveLength(0);
    expect(simulation.startTile).toBeNull();
    expect(tiles.some((tile) => tile.start || tile.target)).toBe(false);
  });
});
