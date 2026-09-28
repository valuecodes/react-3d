import { idleStatus } from "../../../lib/statusStore";
import type {
  SimulationStatus,
  StatusReporter,
} from "../../../lib/statusStore";
import type { PathLine } from "../../../three/pathline";
import type { Simulation as SimulationControls } from "../../../three/useSimulation";
import { COLOR_INDEX, WALL } from "../options";
import type { Algorithm, ObstacleCommand } from "../options";
import {
  idleAStar,
  mazeNeighbors,
  openNeighbors,
  startAStar,
  stepAStar,
} from "./astar";
import type { AStarState } from "./astar";
import {
  addObstacles,
  applyReadyMaze,
  clearObstacles,
  resetHexasphere,
} from "./hexasphere";
import type { Hexasphere } from "./hexasphere";
import { idleMaze, startMaze, stepMaze } from "./maze";
import type { MazeState } from "./maze";
import type { Tile } from "./tile";

/**
 * Owns all mutable algorithm state for one hexasphere. React only forwards
 * option changes and pointer events to it and calls `tick` every frame.
 * Every change ends in `report()`, which is how the sidebar learns the phase.
 */
export class Simulation implements SimulationControls {
  algorithm: Algorithm | null = null;
  astar: AStarState = idleAStar();
  maze: MazeState = idleMaze();
  startTile: Tile | null = null;
  targetTile: Tile | null = null;
  /** Set by the user; `tick` is not called while paused, and any edit clears it. */
  paused = false;
  /** True once a maze or search finished (kept until the next reset or restart). */
  private finished = false;

  constructor(
    readonly hexasphere: Hexasphere,
    readonly pathLine: PathLine,
    /** Detail level used to look up the precomputed maze. */
    readonly detail: number,
    private readonly reporter: StatusReporter = () => undefined
  ) {}

  /** Switches algorithm and resets the sphere to that algorithm's starting state. */
  setAlgorithm(algorithm: Algorithm | null): void {
    this.algorithm = algorithm;
    this.reset();
  }

  /** Stops everything and restores the sphere for the current algorithm. */
  reset(): void {
    this.astar = idleAStar();
    this.maze = idleMaze();
    this.startTile = null;
    this.targetTile = null;
    this.paused = false;
    this.finished = false;
    resetHexasphere(this.hexasphere);
    this.pathLine.setPath([]);

    const { tiles } = this.hexasphere;
    switch (this.algorithm) {
      case "Maze Creator":
        for (const tile of tiles) tile.setWallColors(WALL.visited);
        break;
      case "Maze Pathfinder":
        for (const tile of tiles) tile.setWallColors(WALL.visited);
        applyReadyMaze(this.hexasphere, this.detail);
        break;
      case "Pathfinder":
      case null:
        break;
    }
    this.report();
  }

  /** The "Start" command. */
  start(): void {
    if (this.algorithm === "Maze Creator") {
      // Always carve a fresh maze, even right after a finished one.
      this.reset();
      this.maze = startMaze(this.hexasphere.tiles);
      this.report();
      return;
    }
    this.restartAStar();
    this.report();
  }

  pause(): void {
    if (!this.isRunning()) return;
    this.paused = true;
    this.report();
  }

  resume(): void {
    this.paused = false;
    this.report();
  }

  setObstacles(command: ObstacleCommand): void {
    if (command === "Set random") addObstacles(this.hexasphere);
    else clearObstacles(this.hexasphere);
    // Both commands clear the start and target markers.
    this.startTile = null;
    this.targetTile = null;
    this.astar = idleAStar();
    this.paused = false;
    this.finished = false;
    this.pathLine.setPath([]);
    this.report();
  }

  /** Drag-painting an obstacle. Start and target tiles cannot become obstacles. */
  paintObstacle(tile: Tile): void {
    if (tile.start || tile.target || tile.obstacle) return;
    tile.obstacle = true;
    tile.setColor(COLOR_INDEX.obstacle);
    tile.setWallColors(WALL.visited);
    this.restartAStar();
    this.report();
  }

  setStart(tile: Tile): void {
    if (tile.target) return;
    if (this.startTile) {
      this.startTile.start = false;
      this.startTile.setColor(this.startTile.baseColor);
    }
    tile.setColor(COLOR_INDEX.start);
    tile.start = true;
    this.startTile = tile;
    this.restartAStar();
    this.report();
  }

  setTarget(tile: Tile): void {
    if (tile.start) return;
    if (this.targetTile) {
      this.targetTile.target = false;
      this.targetTile.setColor(this.targetTile.baseColor);
    }
    tile.setColor(COLOR_INDEX.target);
    tile.target = true;
    this.targetTile = tile;
    this.restartAStar();
    this.report();
  }

  /** Advances whichever algorithm is running by one step. */
  tick(): void {
    if (this.paused) return;
    let stepped = false;
    if (this.maze.running) {
      stepMaze(this.maze);
      stepped = true;
    }
    if (this.astar.running) {
      stepAStar(this.astar, this.pathLine);
      stepped = true;
    }
    if (!stepped) return;
    if (!this.isRunning()) this.finished = true;
    this.report();
  }

  /** The current status, as the sidebar sees it. */
  status(): SimulationStatus {
    const { algorithm, astar, maze, startTile, targetTile } = this;
    const total = this.hexasphere.tiles.length;
    const details = [
      { label: "Tiles", value: String(total) },
      { label: "Visited", value: String(astar.closedSet.length) },
      { label: "Path length", value: String(astar.path.length) },
    ];

    if (algorithm === null) {
      return { ...idleStatus("Choose an algorithm"), details: [] };
    }
    if (algorithm === "Maze Creator") {
      const visited = this.hexasphere.tiles.filter(
        (tile) => tile.visited
      ).length;
      const progress = maze.running || this.finished ? visited / total : null;
      return {
        phase: this.phase(),
        progress,
        message: maze.running
          ? this.paused
            ? "Paused"
            : "Carving the maze"
          : this.finished
            ? "Maze ready"
            : "Start carves a random maze",
        canStart: true,
        details: [
          { label: "Tiles", value: String(total) },
          { label: "Visited", value: String(visited) },
        ],
      };
    }

    const canStart = startTile !== null && targetTile !== null;
    let message = "Place a start tile";
    if (startTile && !targetTile) message = "Place a target tile";
    else if (astar.noSolution) message = "No path found";
    else if (astar.running) message = this.paused ? "Paused" : "Searching";
    else if (this.finished) message = "Path found";
    else if (canStart) message = "Start runs the search again";

    return {
      phase: this.phase(),
      progress: null,
      message,
      canStart,
      details,
    };
  }

  private isRunning(): boolean {
    return this.maze.running || this.astar.running;
  }

  private phase(): SimulationStatus["phase"] {
    if (this.astar.noSolution) return "failed";
    if (this.isRunning()) return this.paused ? "paused" : "running";
    return this.finished ? "done" : "idle";
  }

  private report(): void {
    this.reporter(this.status());
  }

  private restartAStar(): void {
    this.paused = false;
    this.finished = false;
    const { startTile, targetTile } = this;
    if (!startTile || !targetTile) return;
    const { tiles } = this.hexasphere;
    if (this.algorithm === "Pathfinder") {
      this.astar = startAStar(tiles, startTile, targetTile, openNeighbors);
    } else if (this.algorithm === "Maze Pathfinder") {
      this.astar = startAStar(tiles, startTile, targetTile, mazeNeighbors);
    }
  }
}
