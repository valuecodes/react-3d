import { calculatePath, pickLowestF } from "../../../lib/graph/aStar";
import { euclidean } from "../../../lib/graph/graphNode";
import type { PathLine } from "../../../three/pathline";
import { COLOR_INDEX } from "../options";
import type { Tile } from "./tile";

export { calculatePath };

export type NeighborsOf = (tile: Tile) => readonly Tile[];

/** Pathfinder mode: any neighbour that is not an obstacle. */
export const openNeighbors: NeighborsOf = (tile) =>
  tile.neighbors.filter((neighbor) => !neighbor.obstacle);

/** Maze mode: only neighbours reachable through open walls. */
export const mazeNeighbors: NeighborsOf = (tile) => tile.availableNeighbors;

export type AStarState = {
  running: boolean;
  openSet: Tile[];
  closedSet: Tile[];
  path: Tile[];
  noSolution: boolean;
  target: Tile | null;
  neighborsOf: NeighborsOf;
};

export function idleAStar(): AStarState {
  return {
    running: false,
    openSet: [],
    closedSet: [],
    path: [],
    noSolution: false,
    target: null,
    neighborsOf: openNeighbors,
  };
}

/** Clears the previous search from every tile and queues `start`. */
export function startAStar(
  tiles: readonly Tile[],
  start: Tile,
  target: Tile,
  neighborsOf: NeighborsOf
): AStarState {
  for (const tile of tiles) {
    tile.f = 0;
    tile.g = 0;
    tile.h = 0;
    tile.previous = null;
    if (tile !== start && tile !== target && !tile.obstacle)
      tile.setColor(tile.baseColor);
  }
  return {
    running: true,
    openSet: [start],
    closedSet: [],
    path: [],
    noSolution: false,
    target,
    neighborsOf,
  };
}

/** Expands one node per call so the search animates frame by frame. */
export function stepAStar(state: AStarState, pathLine: PathLine): void {
  if (!state.running) return;
  const { openSet, closedSet, target } = state;
  let current: Tile | null = null;

  if (openSet.length > 0) {
    const winner = pickLowestF(openSet);
    current = openSet[winner] ?? null;
    if (!current) return;

    current.setColor(COLOR_INDEX.current);
    if (current === target) state.running = false;

    openSet.splice(winner, 1);
    closedSet.push(current);

    for (const neighbor of state.neighborsOf(current)) {
      if (closedSet.includes(neighbor)) continue;
      const tentativeG = current.g + 1;
      let improved = false;
      if (openSet.includes(neighbor)) {
        if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          improved = true;
        }
      } else {
        neighbor.g = tentativeG;
        improved = true;
        openSet.push(neighbor);
      }
      if (improved && target) {
        neighbor.h = heuristic(neighbor, target);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }
  } else {
    state.noSolution = true;
    state.running = false;
  }

  for (const tile of closedSet) tile.setColor(COLOR_INDEX.closedSet);
  for (const tile of openSet) tile.setColor(COLOR_INDEX.openSet);

  if (!state.noSolution) state.path = calculatePath(current);
  for (const tile of state.path) tile.setColor(COLOR_INDEX.path);
  pathLine.setPath(state.path);
}

export const heuristic: (a: Tile, b: Tile) => number = euclidean;
