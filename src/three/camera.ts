import type { CameraPreset, SceneDefinition, Vec3 } from "../scenes/types";

/** A one-shot request to the camera rig, numbered so each press is applied once. */
export type CameraCommand =
  | { seq: number; kind: "goto"; position: Vec3; target: Vec3 }
  | { seq: number; kind: "orbit"; yaw: number };

const ORIGIN: Vec3 = [0, 0, 0];

function length([x, y, z]: Vec3): number {
  return Math.hypot(x, y, z);
}

/** Initial, the four axis views at the scene's distance, then the scene's own presets. */
export function presetsFor(
  camera: SceneDefinition["camera"]
): readonly CameraPreset[] {
  const target = camera.target ?? ORIGIN;
  const d = length(camera.position);
  // A hair off the pole so OrbitControls keeps a defined up vector.
  const epsilon = 0.001;
  return [
    { id: "initial", label: "Initial", position: camera.position, target },
    { id: "front", label: "Front", position: [0, 0, d], target },
    { id: "back", label: "Back", position: [0, 0, -d], target },
    { id: "top", label: "Top", position: [0, d, epsilon], target },
    { id: "bottom", label: "Bottom", position: [0, -d, epsilon], target },
    ...(camera.extraPresets ?? []).map((preset) => ({
      ...preset,
      target: preset.target ?? target,
    })),
  ];
}
