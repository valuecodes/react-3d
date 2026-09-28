import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { ModePill } from "../components/shell/ModePill";
import { useStore } from "../lib/store";
import { viewportStore } from "../lib/viewportStore";
import type { SceneDefinition } from "../scenes/types";
import type { CameraCommand } from "./camera";
import { CameraRig } from "./CameraRig";
import { Helpers } from "./Helpers";
import type { HelperToggles } from "./Helpers";
import { Lights } from "./Lights";

type Props = {
  scene: SceneDefinition;
  helpers: HelperToggles;
  command: CameraCommand | null;
  orbitToggle: boolean;
};

/** The canvas and everything drawn over it. Fills whatever flex space the shell gives it. */
export function Viewport({ scene, helpers, command, orbitToggle }: Props) {
  const { cursor, orbitEnabled } = useStore(viewportStore);
  // Stable object so react-three-fiber never re-applies it on re-render.
  const camera = useMemo(
    () => ({
      position: [...scene.camera.position] as [number, number, number],
      fov: 50,
    }),
    [scene]
  );

  return (
    <div className="relative min-w-0 flex-1" style={{ cursor }}>
      <Canvas flat camera={camera}>
        <Lights />
        <Helpers {...helpers} />
        <CameraRig
          scene={scene}
          command={command}
          enabled={orbitToggle && orbitEnabled}
        />
        <scene.Scene />
      </Canvas>
      <ModePill />
    </div>
  );
}
