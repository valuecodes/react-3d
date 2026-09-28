import type { ReactNode } from "react";

export type Vec3 = readonly [number, number, number];

export type CameraPreset = {
  id: string;
  label: string;
  position: Vec3;
  target?: Vec3;
};

/**
 * One entry in the scene picker. The shell mounts `Provider` around both the
 * sidebar `Panel` and the in-canvas `Scene` (react-three-fiber bridges React
 * context into the Canvas), so scene-local state lives in the provider.
 */
export type SceneDefinition = {
  /** URL-hash slug, `/^[a-z0-9-]+$/`. */
  id: string;
  name: string;
  summary: string;
  camera: {
    position: Vec3;
    target?: Vec3;
    extraPresets?: readonly CameraPreset[];
  };
  Provider: (props: { children: ReactNode }) => ReactNode;
  Scene: () => ReactNode;
  Panel: () => ReactNode;
};
