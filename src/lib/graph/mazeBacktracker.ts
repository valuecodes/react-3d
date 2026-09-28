import { pickRandom } from "./graphNode";

/** Recursive backtracker (depth-first) maze generation, one step at a time. */
export type MazeState<N> = {
  running: boolean;
  /** The cell the walker is on; null once finished. */
  current: N | null;
  stack: N[];
  /** Cells visited so far, including the start. */
  carved: number;
};

export type MazeHooks<N> = {
  unvisitedNeighbors: (node: N) => readonly N[];
  removeWallsBetween: (a: N, b: N) => void;
  random: () => number;
};

export function idleMaze<N>(): MazeState<N> {
  return { running: false, current: null, stack: [], carved: 0 };
}

export function startMaze<N extends { visited: boolean }>(
  start: N
): MazeState<N> {
  start.visited = true;
  return { running: true, current: start, stack: [], carved: 1 };
}

/**
 * Moves the walker once: into an unvisited neighbour (carving a passage), or
 * back down the stack. Returns the new head, or null when the maze is done.
 */
export function stepMaze<N extends { visited: boolean }>(
  state: MazeState<N>,
  hooks: MazeHooks<N>
): N | null {
  const { current } = state;
  if (!state.running || !current) return null;

  const next = pickRandom(hooks.unvisitedNeighbors(current), hooks.random);
  if (next) {
    state.stack.push(current);
    hooks.removeWallsBetween(current, next);
    next.visited = true;
    state.carved += 1;
    state.current = next;
    return next;
  }

  const previous = state.stack.pop();
  if (previous) {
    state.current = previous;
    return previous;
  }

  state.running = false;
  state.current = null;
  return null;
}
