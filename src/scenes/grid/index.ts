import type { SceneDefinition } from "../types";
import type { GridVariant } from "./grid";
import { GridPanel } from "./GridPanel";
import { createGridProvider } from "./GridProvider";
import { GridScene } from "./GridScene";

type GridSceneMeta = Pick<SceneDefinition, "id" | "name" | "summary">;

function defineGridScene(
  variant: GridVariant,
  meta: GridSceneMeta
): SceneDefinition {
  return {
    ...meta,
    // Above and in front of the board, which is centred on the origin.
    camera: { position: [0, 90, 70] },
    Provider: createGridProvider(variant),
    Scene: GridScene,
    Panel: GridPanel,
  };
}

/** The three flat-board scenes, in picker order. */
export const gridScenes: readonly SceneDefinition[] = [
  defineGridScene("astar", {
    id: "grid-astar",
    name: "Grid A*",
    summary: "A* pathfinding across a board with obstacles",
  }),
  defineGridScene("maze", {
    id: "grid-maze",
    name: "Grid Maze",
    summary: "Recursive backtracker carving a maze on a board",
  }),
  defineGridScene("mazePathfinder", {
    id: "grid-maze-pathfinder",
    name: "Grid Maze Pathfinder",
    summary: "Carves a maze, then A* finds the way through it",
  }),
];
