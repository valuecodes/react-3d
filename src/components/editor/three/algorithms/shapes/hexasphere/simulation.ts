import { COLOR_INDEX, WALL } from "../../../../../../context/options";
import type {
  Algorithm,
  ObstacleCommand,
} from "../../../../../../context/options";
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
import type { PathLine } from "./pathline";
import type { Tile } from "./tile";

/**
 * Owns all mutable algorithm state for one hexasphere. React only forwards
 * option changes and pointer events to it and calls `tick` every frame.
 */
export class Simulation {
  algorithm: Algorithm | null = null;
  astar: AStarState = idleAStar();
  maze: MazeState = idleMaze();
  startTile: Tile | null = null;
  targetTile: Tile | null = null;

  constructor(
    readonly hexasphere: Hexasphere,
    readonly pathLine: PathLine,
    /** Detail level used to look up the precomputed maze. */
    readonly detail: number
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
  }

  /** The "Start" command. */
  start(): void {
    if (this.algorithm === "Maze Creator") {
      // Always carve a fresh maze, even right after a finished one.
      this.reset();
      this.maze = startMaze(this.hexasphere.tiles);
      return;
    }
    this.restartAStar();
  }

  setObstacles(command: ObstacleCommand): void {
    if (command === "Set random") addObstacles(this.hexasphere);
    else clearObstacles(this.hexasphere);
    // Both commands clear the start and target markers.
    this.startTile = null;
    this.targetTile = null;
    this.astar = idleAStar();
    this.pathLine.setPath([]);
  }

  /** Drag-painting an obstacle. Start and target tiles cannot become obstacles. */
  paintObstacle(tile: Tile): void {
    if (tile.start || tile.target || tile.obstacle) return;
    tile.obstacle = true;
    tile.setColor(COLOR_INDEX.obstacle);
    tile.setWallColors(WALL.visited);
    this.restartAStar();
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
  }

  /** Advances whichever algorithm is running by one step. */
  tick(): void {
    if (this.maze.running) stepMaze(this.maze);
    if (this.astar.running) stepAStar(this.astar, this.pathLine);
  }

  private restartAStar(): void {
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
