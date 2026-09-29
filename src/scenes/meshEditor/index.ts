import type { SceneDefinition } from "../types";
import { MeshEditorPanel } from "./MeshEditorPanel";
import { MeshEditorProvider } from "./MeshEditorProvider";
import { MeshEditorScene } from "./MeshEditorScene";

export const meshEditorScene: SceneDefinition = {
  id: "mesh-editor",
  name: "Mesh Editor",
  summary: "Drag vertices, edges and faces of a box",
  camera: { position: [60, 50, 80] },
  Provider: MeshEditorProvider,
  Scene: MeshEditorScene,
  Panel: MeshEditorPanel,
};
