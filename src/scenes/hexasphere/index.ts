import type { SceneDefinition } from "../types";
import { HexaspherePanel } from "./HexaspherePanel";
import { HexasphereProvider } from "./HexasphereProvider";
import { HexasphereScene } from "./HexasphereScene";

export const hexasphereScene: SceneDefinition = {
  id: "hexasphere",
  name: "Hexasphere",
  summary: "Mazes and A* on a hexagon-tiled sphere",
  camera: {
    position: [0, 70, 100],
    extraPresets: [
      {
        id: "inside",
        label: "Inside",
        position: [1, 1, 1],
        target: [0, 0, 50],
      },
    ],
  },
  Provider: HexasphereProvider,
  Scene: HexasphereScene,
  Panel: HexaspherePanel,
};
