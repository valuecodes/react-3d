import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import { useGlobalOptions } from "../../../context/GlobalOptions";
import CameraControls from "../../../utils/orbit/cameraControls";
import type { CameraSettings } from "../../../utils/orbit/cameraControls";
import OrbitControl from "../../../utils/orbit/orbitControl";
import HexaSphere from "./algorithms/hexasphere/HexaSphere";
import Navigation from "./navigation/navigation";

const INITIAL_CAMERA: CameraSettings = {
  cameraPosition: [0, 70, 100],
  cameraRotation: [0.6, 0, 0],
  orbit: true,
  axes: false,
  grid: false,
  mode: "orbit",
};

/** Scenes the navigation bar can step through. More are added as the legacy scenes are ported. */
const SCENES = [{ name: "Hexasphere", render: () => <HexaSphere /> }] as const;

export default function Three() {
  const { options, setOption } = useGlobalOptions();
  const [cameraSettings, setCameraSettings] = useState(INITIAL_CAMERA);
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = SCENES[sceneIndex] ?? SCENES[0];

  const changeCameraSettings = <K extends keyof CameraSettings>(
    key: K,
    value: CameraSettings[K]
  ) => {
    setCameraSettings((current) => ({ ...current, [key]: value }));
  };

  const stepScene = (direction: -1 | 1) => {
    setSceneIndex((current) =>
      Math.min(Math.max(current + direction, 0), SCENES.length - 1)
    );
  };

  return (
    <div id="three">
      <Canvas
        id="canvas"
        flat
        camera={{ position: [0, 70, 100] }}
        onDoubleClick={() => setOption({ key: "Mode", value: "Rotate" })}
      >
        {/* Lights are physically based since three r155; PI restores the legacy intensity. */}
        <ambientLight intensity={Math.PI} />
        <OrbitControl
          cameraPosition={cameraSettings.cameraPosition}
          inside={options.Position === "Inside"}
          enabled={cameraSettings.orbit && options.Mode === "Rotate"}
        />
        <group rotation={cameraSettings.cameraRotation} position={[2, 2, 2]}>
          {scene.render()}
        </group>
      </Canvas>
      <Navigation
        sceneName={scene.name}
        onPrevious={() => stepScene(-1)}
        onNext={() => stepScene(1)}
      />
      <CameraControls
        cameraSettings={cameraSettings}
        changeCameraSettings={changeCameraSettings}
      />
    </div>
  );
}
