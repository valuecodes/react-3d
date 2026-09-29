import { startAStar, stepAStar } from "../../lib/graph/aStar";
import type { AStarHooks, AStarState } from "../../lib/graph/aStar";
import { euclidean } from "../../lib/graph/graphNode";
import { idleMaze, startMaze, stepMaze } from "../../lib/graph/mazeBacktracker";
import type { MazeHooks, MazeState } from "../../lib/graph/mazeBacktracker";
import { at } from "../../lib/invariant";
import type { SimulationStatus, StatusReporter } from "../../lib/statusStore";
import { PathCursor } from "../../three/pathCursor";
import type { PathLine } from "../../three/pathline";
import type { Simulation } from "../../three/useSimulation";
import { layObstacles, pathPoints, removeWallsBetween, resetRun } from "./cube";
import type { Cube, CubeCell, PathPoint } from "./cube";
import { CELL_COLOR } from "./cubeMeshes";
import type { CellColor, CubeMeshes } from "./cubeMeshes";
import type { FaceName } from "./formations";

export type CubeVariant = "maze" | "astar" | "mazePathfinder";

export type Stage = "idle" | "maze" | "astar" | "tracking" | "done" | "failed";

/** Path points the tracker advances per tick. */
export const TRACK_STEP = 0.2;

const VARIANT_HINT: Record<CubeVariant, string> = {
  maze: "Start carves a maze from the start cell",
  astar: "Start searches from the start to the target",
  mazePathfinder: "Start carves a maze, then searches it",
};

/**
 * Owns all mutable algorithm state for one cube: the stage machine
 * idle -> maze -> astar -> tracking -> done | failed (each variant uses the
 * stages it needs), the start and target markers, the drawn path and the
 * tracker's cursor. React forwards option changes and pointer events and
 * calls `tick` every frame; every change ends in `report()`.
 */
export class CubeSimulation implements Simulation {
  stage: Stage = "idle";
  /** Set by the user; `tick` does nothing while paused, and any edit clears it. */
  paused = false;
  maze: MazeState<CubeCell> = idleMaze();
  astar: AStarState<CubeCell> | null = null;
  readonly cursor = new PathCursor();
  /** The face the scene turns toward when auto-rotating. */
  activeFace: FaceName;
  startCell: CubeCell;
  targetCell: CubeCell;
  /** The drawn path, start first, with edge points inserted between faces. */
  linePoints: readonly PathPoint[] = [];
  /** Bumped whenever `linePoints` changes, so the scene can refresh the line. */
  pathVersion = 0;

  /** True once the maze is carved (a new search reuses it). */
  private mazeReady = false;
  private mazeHead: CubeCell | null = null;
  private paintedPath: readonly CubeCell[] = [];
  private readonly mazeHooks: MazeHooks<CubeCell>;
  private readonly searchHooks: AStarHooks<CubeCell>;

  constructor(
    readonly cube: Cube,
    readonly meshes: CubeMeshes,
    readonly pathLine: PathLine,
    readonly variant: CubeVariant,
    private readonly random: () => number = Math.random,
    private readonly reporter: StatusReporter = () => undefined
  ) {
    this.mazeHooks = {
      unvisitedNeighbors: (cell) =>
        cell.sideTo.filter(
          (next): next is CubeCell => next !== null && !next.visited
        ),
      removeWallsBetween: (a, b) => {
        removeWallsBetween(a, b);
        meshes.syncWalls(a);
        meshes.syncWalls(b);
      },
      random,
    };
    this.searchHooks = {
      neighborsOf:
        variant === "mazePathfinder"
          ? (cell) => cell.passages
          : (cell) => cell.neighbors.filter((next) => !next.obstacle),
      heuristic: euclidean,
      cost: euclidean,
    };
    this.startCell = at(cube.cells, 0);
    this.targetCell = this.randomTarget();
    this.activeFace = this.startCell.face;
    this.initialise();
  }

  /** Stops everything, re-scatters obstacles and keeps the markers. */
  reset(): void {
    this.initialise();
    this.report();
  }

  /** The "Start" command: always a fresh run. */
  start(): void {
    this.beginRun();
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

  setStart(cell: CubeCell): void {
    if (cell === this.targetCell) return;
    this.moveMarker("start", cell);
  }

  setTarget(cell: CubeCell): void {
    if (cell === this.startCell) return;
    this.moveMarker("target", cell);
  }

  /** Advances whichever stage is running by one step. */
  tick(): void {
    if (this.paused || !this.inProgress()) return;
    switch (this.stage) {
      case "maze":
        this.tickMaze();
        break;
      case "astar":
        this.tickSearch();
        break;
      case "tracking":
        this.tickTracking();
        break;
      default:
        return;
    }
    this.report();
  }

  /** The tracker is shown from the moment a path is found until the next run. */
  trackerActive(): boolean {
    return (
      (this.stage === "tracking" || this.stage === "done") &&
      this.variant !== "maze" &&
      this.linePoints.length > 0
    );
  }

  /** The current status, as the sidebar sees it. */
  status(): SimulationStatus {
    const { stage, paused, astar, maze, variant } = this;
    const total = this.cube.cells.length;
    const details = [
      { label: "Faces", value: String(this.cube.faces.length) },
      { label: "Cells", value: String(total) },
    ];
    if (stage === "maze" || (variant === "maze" && stage === "done")) {
      details.push({
        label: "Carved",
        value: `${this.carvedCount()} / ${total}`,
      });
    }
    if (astar) {
      details.push({ label: "Visited", value: String(astar.closedSet.length) });
      details.push({ label: "Path length", value: String(astar.path.length) });
    }

    let phase: SimulationStatus["phase"];
    let message: string;
    let progress: number | null = null;
    switch (stage) {
      case "idle":
        phase = "idle";
        message = VARIANT_HINT[variant];
        break;
      case "maze":
        phase = paused ? "paused" : "running";
        message = paused ? "Paused" : "Carving the maze";
        progress = maze.carved / total;
        break;
      case "astar":
        phase = paused ? "paused" : "running";
        message = paused ? "Paused" : "Searching";
        break;
      case "tracking":
        phase = paused ? "paused" : "running";
        message = paused ? "Paused" : "Walking the path";
        progress = this.cursor.progress;
        break;
      case "done":
        phase = "done";
        message = variant === "maze" ? "Maze ready" : "Path found";
        progress = 1;
        break;
      case "failed":
        phase = "failed";
        message = "No path found";
        break;
    }
    return { phase, progress, message, canStart: true, details };
  }

  private inProgress(): boolean {
    return (
      this.stage === "maze" ||
      this.stage === "astar" ||
      this.stage === "tracking"
    );
  }

  private report(): void {
    this.reporter(this.status());
  }

  private randomTarget(): CubeCell {
    const { cells } = this.cube;
    const half = Math.floor(cells.length / 2);
    const index = Math.min(
      half + Math.floor(this.random() * (cells.length - half)),
      cells.length - 1
    );
    const cell = at(cells, index);
    return cell === this.startCell ? at(cells, cells.length - 1) : cell;
  }

  /** Back to idle: fresh obstacles, closed walls, plain colours, markers kept. */
  private initialise(): void {
    this.stage = "idle";
    this.paused = false;
    this.mazeReady = false;
    this.maze = idleMaze();
    this.mazeHead = null;
    this.astar = null;
    this.paintedPath = [];
    resetRun(this.cube);
    for (const cell of this.cube.cells) cell.obstacle = false;
    if (this.cube.options.obstacles) layObstacles(this.cube, this.random);
    this.startCell.obstacle = false;
    this.targetCell.obstacle = false;
    this.startCell.start = true;
    this.targetCell.target = true;
    this.meshes.closeAllWalls();
    for (const cell of this.cube.cells) this.paintBase(cell);
    this.clearPath();
    this.activeFace = this.startCell.face;
  }

  /** A fresh run for the variant, keeping obstacles and markers. */
  private beginRun(): void {
    this.paused = false;
    this.mazeReady = false;
    this.astar = null;
    this.paintedPath = [];
    resetRun(this.cube);
    this.meshes.closeAllWalls();
    for (const cell of this.cube.cells) this.paintBase(cell);
    this.clearPath();
    if (this.variant === "astar") {
      this.beginSearch();
      return;
    }
    this.maze = startMaze(this.startCell);
    this.mazeHead = this.startCell;
    this.paintCell(this.startCell, CELL_COLOR.current);
    this.stage = "maze";
    this.activeFace = this.startCell.face;
  }

  /** Starts A* on the current graph (obstacles or carved passages). */
  private beginSearch(): void {
    this.paused = false;
    this.maze = idleMaze();
    this.mazeHead = null;
    this.paintedPath = [];
    for (const cell of this.cube.cells) this.paintBase(cell);
    this.clearPath();
    this.astar = startAStar(
      this.cube.cells,
      this.startCell,
      this.targetCell,
      this.searchHooks
    );
    this.stage = "astar";
    this.activeFace = this.startCell.face;
  }

  private moveMarker(kind: "start" | "target", cell: CubeCell): void {
    const previous = kind === "start" ? this.startCell : this.targetCell;
    if (kind === "start") {
      previous.start = false;
      cell.start = true;
      this.startCell = cell;
    } else {
      previous.target = false;
      cell.target = true;
      this.targetCell = cell;
    }
    // Markers never sit on an obstacle.
    cell.obstacle = false;
    this.paintBase(previous);
    this.paintBase(cell);
    this.activeFace = cell.face;
    this.afterEdit();
  }

  /** An edit restarts whatever was running (a carved maze is searched again, not re-carved). */
  private afterEdit(): void {
    if (this.stage === "idle") {
      this.report();
      return;
    }
    if (this.variant === "mazePathfinder" && this.mazeReady) {
      this.beginSearch();
    } else {
      this.beginRun();
    }
    this.report();
  }

  private tickMaze(): void {
    const head = stepMaze(this.maze, this.mazeHooks);
    if (this.mazeHead) this.paintCell(this.mazeHead, CELL_COLOR.visited);
    if (head) {
      this.paintCell(head, CELL_COLOR.current);
      this.mazeHead = head;
      this.activeFace = head.face;
      return;
    }
    this.mazeHead = null;
    this.mazeReady = true;
    if (this.variant === "maze") {
      this.stage = "done";
      return;
    }
    this.beginSearch();
  }

  private tickSearch(): void {
    const state = this.astar;
    if (!state) return;
    const node = stepAStar(state, this.searchHooks);
    if (!node) {
      if (state.noSolution) this.stage = "failed";
      return;
    }
    this.activeFace = node.face;
    this.paintCell(node, CELL_COLOR.closedSet);
    for (const neighbor of this.searchHooks.neighborsOf(node)) {
      if (state.open.has(neighbor))
        this.paintCell(neighbor, CELL_COLOR.openSet);
    }
    // Every path cell has been expanded, so the old path returns to the closed colour.
    for (const cell of this.paintedPath)
      this.paintCell(cell, CELL_COLOR.closedSet);
    this.paintedPath = state.path.slice();
    for (const cell of this.paintedPath) this.paintCell(cell, CELL_COLOR.path);
    this.setPath(pathPoints(this.cube, [...state.path].reverse()));

    if (!state.running) {
      this.cursor.setPath(this.linePoints);
      this.stage = "tracking";
    }
  }

  private tickTracking(): void {
    const done = this.cursor.advance(TRACK_STEP);
    const last = this.linePoints.length - 1;
    const index = Math.min(Math.floor(this.cursor.progress * last), last);
    const point = this.linePoints[index];
    if (point) this.activeFace = point.cell.face;
    if (done) this.stage = "done";
  }

  private carvedCount(): number {
    let carved = 0;
    for (const cell of this.cube.cells) if (cell.visited) carved++;
    return carved;
  }

  private setPath(points: readonly PathPoint[]): void {
    this.linePoints = points;
    this.pathVersion++;
  }

  private clearPath(): void {
    this.setPath([]);
    this.cursor.setPath([]);
    this.pathLine.setPath([]);
  }

  /** Algorithm colours never cover the start and target markers. */
  private paintCell(cell: CubeCell, color: CellColor): void {
    if (cell.start || cell.target) return;
    this.meshes.paint(cell, color);
  }

  private paintBase(cell: CubeCell): void {
    const color = cell.start
      ? CELL_COLOR.start
      : cell.target
        ? CELL_COLOR.target
        : cell.obstacle
          ? CELL_COLOR.obstacle
          : CELL_COLOR.initial;
    this.meshes.paint(cell, color);
    this.meshes.setObstacle(cell, cell.obstacle);
  }
}
