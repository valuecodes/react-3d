import { at, invariant } from "../../../lib/invariant";
import { COLOR_INDEX } from "../options";
import type { Tile } from "./tile";

/** Randomised depth-first maze generation, one step per frame. */
export type MazeState = {
  running: boolean;
  current: Tile | null;
  stack: Tile[];
};

export function idleMaze(): MazeState {
  return { running: false, current: null, stack: [] };
}

export function startMaze(tiles: readonly Tile[]): MazeState {
  return { running: true, current: at(tiles, 0), stack: [] };
}

export function stepMaze(state: MazeState): void {
  const { current } = state;
  if (!state.running || !current) return;

  current.visited = true;
  current.setColor(COLOR_INDEX.selected);

  const next = current.getNextNeighbor();
  if (next) {
    next.setColor(COLOR_INDEX.current);
    state.stack.push(current);
    removeWallsBetween(current, next);
    state.current = next;
    return;
  }

  const back = state.stack.pop();
  if (back) {
    state.current = back;
  } else {
    state.running = false;
  }
}

/** Opens the shared wall from both sides and records the passage. */
export function removeWallsBetween(a: Tile, b: Tile): void {
  const wallA = a.wallFacing(b);
  const wallB = b.wallFacing(a);
  invariant(
    wallA !== undefined && wallB !== undefined,
    "Tiles are not neighbours"
  );
  a.removeWall(wallA);
  b.removeWall(wallB);
  a.availableNeighbors.push(b);
  b.availableNeighbors.push(a);
}
