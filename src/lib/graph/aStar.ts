import { at } from "../invariant";
import type { GraphNode } from "./graphNode";

export type AStarState<N> = {
  running: boolean;
  openSet: N[];
  closedSet: N[];
  /** Best known path to the most recently expanded node, target first. */
  path: N[];
  noSolution: boolean;
  start: N;
  target: N;
  open: Set<N>;
  closed: Set<N>;
};

export type AStarHooks<N> = {
  neighborsOf: (node: N) => readonly N[];
  heuristic: (a: N, b: N) => number;
  /** Step cost; defaults to the heuristic between the two nodes (exact for straight-line moves). */
  cost?: (a: N, b: N) => number;
};

/** Clears the search fields on every node and opens the start. */
export function startAStar<N extends GraphNode<N>>(
  nodes: readonly N[],
  start: N,
  target: N,
  hooks: AStarHooks<N>
): AStarState<N> {
  for (const node of nodes) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.previous = null;
  }
  start.h = hooks.heuristic(start, target);
  start.f = start.h;
  return {
    running: true,
    openSet: [start],
    closedSet: [],
    path: [],
    noSolution: false,
    start,
    target,
    open: new Set([start]),
    closed: new Set(),
  };
}

/** Index of the open node with the lowest f; the earliest entry wins ties. */
export function pickLowestF<N extends { f: number }>(
  openSet: readonly N[]
): number {
  let winner = 0;
  for (let i = 1; i < openSet.length; i++) {
    if (at(openSet, i).f < at(openSet, winner).f) winner = i;
  }
  return winner;
}

/** Follows `previous` links back from `node`; the result starts at `node`. */
export function calculatePath<N extends { previous: N | null }>(
  node: N | null
): N[] {
  const path: N[] = [];
  for (let current = node; current; current = current.previous) {
    path.push(current);
  }
  return path;
}

/** Expands one node. Returns it, or null when the search is over or idle. */
export function stepAStar<N extends GraphNode<N>>(
  state: AStarState<N>,
  hooks: AStarHooks<N>
): N | null {
  if (!state.running) return null;
  if (state.openSet.length === 0) {
    state.running = false;
    state.noSolution = true;
    return null;
  }

  const index = pickLowestF(state.openSet);
  const current = at(state.openSet, index);
  state.openSet.splice(index, 1);
  state.open.delete(current);
  state.closedSet.push(current);
  state.closed.add(current);
  state.path = calculatePath(current);

  if (current === state.target) {
    state.running = false;
    return current;
  }

  const cost = hooks.cost ?? hooks.heuristic;
  for (const neighbor of hooks.neighborsOf(current)) {
    if (state.closed.has(neighbor)) continue;
    const tentative = current.g + cost(current, neighbor);
    if (!state.open.has(neighbor)) {
      state.open.add(neighbor);
      state.openSet.push(neighbor);
    } else if (tentative >= neighbor.g) {
      continue;
    }
    neighbor.g = tentative;
    neighbor.h = hooks.heuristic(neighbor, state.target);
    neighbor.f = neighbor.g + neighbor.h;
    neighbor.previous = current;
  }
  return current;
}
