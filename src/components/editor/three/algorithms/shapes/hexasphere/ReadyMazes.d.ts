/** `[neighbourIds, walls]` per tile. Only the neighbour list is authoritative; `walls` is legacy derived data. */
export type ReadyMazeEntry = readonly [readonly number[], readonly (0 | 1)[]];

/** Precomputed mazes keyed by detail level (0 to 5), indexed by tile id. */
declare const mazes: Readonly<
  Record<number, readonly ReadyMazeEntry[] | undefined>
>;

export default mazes;
