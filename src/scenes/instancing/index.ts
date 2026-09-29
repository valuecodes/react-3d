import type { SceneDefinition } from "../types";
import { InstancingPanel } from "./InstancingPanel";
import { InstancingProvider } from "./InstancingProvider";
import { InstancingScene } from "./InstancingScene";

export const instancingScene: SceneDefinition = {
  id: "instancing",
  name: "Instancing",
  summary: "Thousands of cylinders in one draw call",
  camera: {
    position: [0, 120, 160],
  },
  Provider: InstancingProvider,
  Scene: InstancingScene,
  Panel: InstancingPanel,
};
