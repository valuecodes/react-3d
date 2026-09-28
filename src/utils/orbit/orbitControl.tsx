import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";

type Props = {
  cameraPosition: readonly [number, number, number];
  /** Puts the camera at the centre of the sphere. */
  inside: boolean;
  enabled: boolean;
};

/** Orbit controls plus the camera placement driven by the option panels. */
export default function OrbitControl({
  cameraPosition,
  inside,
  enabled,
}: Props) {
  const camera = useThree((state) => state.camera);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    const [x, y, z] = inside ? [1, 1, 1] : cameraPosition;
    camera.position.set(x, y, z);
    controls.current?.update();
  }, [camera, cameraPosition, inside]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enabled={enabled}
    />
  );
}
