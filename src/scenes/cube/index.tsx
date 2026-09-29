import type { ReactNode } from "react";

import type { SceneDefinition } from "../types";
import { CubePanel } from "./CubePanel";
import { CubeProvider } from "./CubeProvider";
import { CubeScene } from "./CubeScene";
import type { CubeVariant } from "./cubeSimulation";

/** Frames a cube of side 60 with room for the opened net. */
const CAMERA: SceneDefinition["camera"] = { position: [60, 60, 90] };

function providerFor(variant: CubeVariant): SceneDefinition["Provider"] {
  return function Provider({ children }: { children: ReactNode }) {
    return <CubeProvider variant={variant}>{children}</CubeProvider>;
  };
}

function defineCubeScene(
  id: string,
  name: string,
  summary: string,
  variant: CubeVariant
): SceneDefinition {
  return {
    id,
    name,
    summary,
    camera: CAMERA,
    Provider: providerFor(variant),
    Scene: CubeScene,
    Panel: CubePanel,
  };
}

export const cubeScenes: readonly SceneDefinition[] = [
  defineCubeScene(
    "cube-astar",
    "Cube A*",
    "A* around obstacle clusters on the faces of a cube",
    "astar"
  ),
  defineCubeScene(
    "cube-maze",
    "Cube Maze",
    "A maze carved across the faces of a cube",
    "maze"
  ),
  defineCubeScene(
    "cube-maze-pathfinder",
    "Cube Maze Pathfinder",
    "Carves a maze over the cube, then walks the A* path through it",
    "mazePathfinder"
  ),
];
