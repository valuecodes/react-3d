import { startAStar, stepAStar } from "../../lib/graph/aStar";
import type { AStarHooks, AStarState } from "../../lib/graph/aStar";
import { idleMaze, startMaze, stepMaze } from "../../lib/graph/mazeBacktracker";
import type { MazeHooks, MazeState } from "../../lib/graph/mazeBacktracker";
import type {
  Phase,
  SimulationStatus,
  StatusReporter,
} from "../../lib/statusStore";
import { PathCursor } from "../../three/pathCursor";
import type { PathLine } from "../../three/pathline";
import type { Simulation as SimulationControls } from "../../three/useSimulation";
import {
  clearObstacles,
  closeAllWalls,
  firstCell,
  lastCell,
  MAZE_ASTAR_HOOKS,
  mazeHooks,
  OPEN_ASTAR_HOOKS,
  OPPOSITE,
  randomizeObstacles,
  removeWallsBetween,
} from "./grid";
import type { Grid, GridCell, GridVariant } from "./grid";
import { CELL_COLOR } from "./gridMeshes";
import type { CellColor, GridMeshes } from "./gridMeshes";

/**
 * Where a run is. `maze` carves, `astar` searches, `tracking` walks the
 * tracker along the path. Which stages a run passes through depends on the
 * variant: maze → done; astar → tracking → done | failed; maze → astar →
 * tracking → done | failed.
 */
export type GridStage =
  "idle" | "maze" | "astar" | "tracking" | "done" | "failed";

export type ObstacleCommand = "random" | "clear";

/** Path points the tracker covers per tick. */
const TRACK_STEP = 0.2;

const IDLE_MESSAGE: Record<GridVariant, string> = {
  astar: "Start runs the search",
  maze: "Start carves a random maze",
  mazePathfinder: "Start carves a maze, then solves it",
};

/**
 * Owns all mutable state for one board: the maze walk, the search, the
 * tracker and the start / target / obstacle markers. React forwards option
 * changes and pointer events and calls `tick` every frame; every change ends
 * in `report()`, which is how the sidebar learns the phase.
 */
export class GridSimulation implements SimulationControls {
  stage: GridStage = "idle";
  /** Set by the user; `tick` does nothing while paused, and any edit clears it. */
  paused = false;
  maze: MazeState<GridCell> = idleMaze();
  astar: AStarState<GridCell> | null = null;
  readonly cursor = new PathCursor();
  startCell: GridCell;
  targetCell: GridCell;
  private readonly mazeHooks: MazeHooks<GridCell>;
  private readonly astarHooks: AStarHooks<GridCell>;

  constructor(
    readonly variant: GridVariant,
    readonly grid: Grid,
    readonly meshes: GridMeshes,
    readonly pathLine: PathLine,
    private readonly reporter: StatusReporter = () => undefined,
    random: () => number = Math.random
  ) {
    this.startCell = firstCell(grid);
    this.targetCell = lastCell(grid);
    this.startCell.start = true;
    this.targetCell.target = true;
    // Seeded obstacles may have landed on the default markers.
    this.startCell.obstacle = false;
    this.targetCell.obstacle = false;
    meshes.syncObstacles();
    this.paintAll();

    const pure = mazeHooks(random);
    this.mazeHooks = {
      ...pure,
      removeWallsBetween: (a, b) => {
        if (!removeWallsBetween(a, b)) return;
        const side = a.sideFacing(b);
        if (side === null) return;
        meshes.setWall(a, side, false);
        meshes.setWall(b, OPPOSITE[side], false);
      },
    };
    this.astarHooks = variant === "astar" ? OPEN_ASTAR_HOOKS : MAZE_ASTAR_HOOKS;
  }

  /** The "Start" command: a fresh run for the variant, even right after a finished one. */
  start(): void {
    this.paused = false;
    if (this.variant === "astar") {
      this.beginSearch();
    } else {
      this.closeWalls();
      this.astar = null;
      this.clearPath();
      const origin = firstCell(this.grid);
      this.maze = startMaze(origin);
      this.meshes.paint(origin, CELL_COLOR.current);
      this.stage = "maze";
    }
    this.report();
  }

  pause(): void {
    if (!this.inProgress()) return;
    this.paused = true;
    this.report();
  }

  resume(): void {
    this.paused = false;
    this.report();
  }

  /** Stops everything and restores the board, keeping obstacles and markers. */
  reset(): void {
    this.stage = "idle";
    this.paused = false;
    this.maze = idleMaze();
    this.astar = null;
    this.clearPath();
    if (this.variant !== "astar") this.closeWalls();
    this.paintAll();
    this.report();
  }

  /** Advances whichever stage is active by one step. */
  tick(): void {
    if (this.paused) return;
    switch (this.stage) {
      case "maze":
        this.advanceMaze();
        break;
      case "astar":
        this.advanceSearch();
        break;
      case "tracking":
        this.advanceTracking();
        break;
      case "idle":
      case "done":
      case "failed":
        return;
    }
    this.report();
  }

  setStart(cell: GridCell): void {
    if (cell === this.targetCell || cell.obstacle) return;
    const previous = this.startCell;
    previous.start = false;
    this.startCell = cell;
    cell.start = true;
    this.meshes.paint(previous, this.baseColor(previous));
    this.meshes.paint(cell, this.baseColor(cell));
    this.afterEdit();
  }

  setTarget(cell: GridCell): void {
    if (cell === this.startCell || cell.obstacle) return;
    const previous = this.targetCell;
    previous.target = false;
    this.targetCell = cell;
    cell.target = true;
    this.meshes.paint(previous, this.baseColor(previous));
    this.meshes.paint(cell, this.baseColor(cell));
    this.afterEdit();
  }

  /** Drag-painting an obstacle (A* variant). Start and target cells cannot become obstacles. */
  paintObstacle(cell: GridCell): void {
    if (this.variant !== "astar") return;
    if (cell.start || cell.target || cell.obstacle) return;
    cell.obstacle = true;
    this.meshes.setObstacle(cell, true);
    this.meshes.paint(cell, this.baseColor(cell));
    this.afterEdit();
  }

  setObstacles(command: ObstacleCommand, chance = 0): void {
    if (this.variant !== "astar") return;
    clearObstacles(this.grid);
    if (command === "random")
      randomizeObstacles(this.grid, chance, Math.random);
    this.meshes.syncObstacles();
    this.paintAll();
    this.afterEdit();
  }

  /** The tracker is shown while it walks and stays on the target afterwards. */
  showTracker(): boolean {
    return (
      this.stage === "tracking" ||
      (this.stage === "done" && this.variant !== "maze")
    );
  }

  inProgress(): boolean {
    return (
      this.stage === "maze" ||
      this.stage === "astar" ||
      this.stage === "tracking"
    );
  }

  /** The current status, as the sidebar sees it. */
  status(): SimulationStatus {
    const total = this.grid.cells.length;
    const visited = this.astar?.closedSet.length ?? 0;
    const pathLength = this.astar?.path.length ?? 0;
    const details =
      this.variant === "maze"
        ? [
            { label: "Cells", value: String(total) },
            { label: "Carved", value: String(this.maze.carved) },
          ]
        : [
            { label: "Cells", value: String(total) },
            { label: "Visited", value: String(visited) },
            { label: "Path length", value: String(pathLength) },
          ];
    return {
      phase: this.phase(),
      progress: this.progress(),
      message: this.message(),
      canStart: true,
      details,
    };
  }

  private phase(): Phase {
    switch (this.stage) {
      case "failed":
        return "failed";
      case "done":
        return "done";
      case "idle":
        return "idle";
      case "maze":
      case "astar":
      case "tracking":
        return this.paused ? "paused" : "running";
    }
  }

  private progress(): number | null {
    const total = this.grid.cells.length;
    switch (this.stage) {
      case "maze":
        return this.maze.carved / total;
      case "astar":
        return (this.astar?.closedSet.length ?? 0) / total;
      case "tracking":
        return this.cursor.progress;
      case "done":
        return 1;
      case "idle":
      case "failed":
        return null;
    }
  }

  private message(): string {
    const paused = this.paused ? "Paused" : null;
    switch (this.stage) {
      case "idle":
        return IDLE_MESSAGE[this.variant];
      case "maze":
        return paused ?? "Carving the maze";
      case "astar":
        return paused ?? "Searching";
      case "tracking":
        return paused ?? "Tracking the path";
      case "done":
        return this.variant === "maze" ? "Maze ready" : "Path tracked";
      case "failed":
        return "No path found";
    }
  }

  private report(): void {
    this.reporter(this.status());
  }

  /** Edits clear a pause and, once a run has started, restart the search on the new board. */
  private afterEdit(): void {
    this.paused = false;
    if (this.stage !== "idle" && this.stage !== "maze") {
      if (this.variant === "astar" || this.variant === "mazePathfinder")
        this.beginSearch();
    }
    this.report();
  }

  private beginSearch(): void {
    this.clearPath();
    this.astar = startAStar(
      this.grid.cells,
      this.startCell,
      this.targetCell,
      this.astarHooks
    );
    this.stage = "astar";
    this.paintAll();
  }

  private beginTracking(path: readonly GridCell[]): void {
    // The search path is target first; the tracker walks from the start.
    this.cursor.setPath([...path].reverse());
    this.stage = "tracking";
  }

  private advanceMaze(): void {
    const previous = this.maze.current;
    const head = stepMaze(this.maze, this.mazeHooks);
    if (previous) this.meshes.paint(previous, this.baseColor(previous));
    if (head) this.meshes.paint(head, CELL_COLOR.current);
    if (this.maze.running) return;
    if (this.variant === "maze") this.stage = "done";
    else this.beginSearch();
  }

  private advanceSearch(): void {
    const state = this.astar;
    if (!state) return;
    stepAStar(state, this.astarHooks);
    const { meshes } = this;
    for (const cell of state.closedSet)
      meshes.paint(cell, CELL_COLOR.closedSet);
    for (const cell of state.openSet) meshes.paint(cell, CELL_COLOR.openSet);
    for (const cell of state.path) meshes.paint(cell, CELL_COLOR.path);
    meshes.paint(this.startCell, CELL_COLOR.start);
    meshes.paint(this.targetCell, CELL_COLOR.target);
    this.pathLine.setPath(state.path);
    if (state.running) return;
    if (state.noSolution) this.stage = "failed";
    else this.beginTracking(state.path);
  }

  private advanceTracking(): void {
    if (this.cursor.advance(TRACK_STEP)) this.stage = "done";
  }

  private clearPath(): void {
    this.pathLine.setPath([]);
    this.cursor.setPath([]);
  }

  private closeWalls(): void {
    closeAllWalls(this.grid);
    this.maze = idleMaze();
    this.meshes.syncWalls();
  }

  private paintAll(): void {
    for (const cell of this.grid.cells)
      this.meshes.paint(cell, this.baseColor(cell));
  }

  /** The colour of a cell outside any search painting. */
  private baseColor(cell: GridCell): CellColor {
    if (cell.obstacle) return CELL_COLOR.obstacle;
    if (cell.start) return CELL_COLOR.start;
    if (cell.target) return CELL_COLOR.target;
    if (cell.visited && this.variant !== "astar") return CELL_COLOR.visited;
    return CELL_COLOR.cell;
  }
}
