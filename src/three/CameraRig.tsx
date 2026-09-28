import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { MathUtils, Vector3 } from "three";

import type { SceneDefinition } from "../scenes/types";
import type { CameraCommand } from "./camera";

type Props = {
  scene: SceneDefinition;
  command: CameraCommand | null;
  enabled: boolean;
};

type Goal = { position: Vector3; target: Vector3 };

const UP = new Vector3(0, 1, 0);
/** Exponential decay rate for camera moves; higher is snappier. */
const LAMBDA = 6;
const SETTLED = 0.05;

function dampTowards(vector: Vector3, goal: Vector3, dt: number): void {
  vector.set(
    MathUtils.damp(vector.x, goal.x, LAMBDA, dt),
    MathUtils.damp(vector.y, goal.y, LAMBDA, dt),
    MathUtils.damp(vector.z, goal.z, LAMBDA, dt)
  );
}

/** Orbit controls plus damped moves to the camera presets. */
export function CameraRig({ scene, command, enabled }: Props) {
  const camera = useThree((state) => state.camera);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const goal = useRef<Goal | null>(null);
  const handledSeq = useRef(0);

  // A new scene snaps the camera to its start position (no animation).
  useEffect(() => {
    goal.current = null;
    camera.position.set(...scene.camera.position);
    const target = scene.camera.target ?? [0, 0, 0];
    controls.current?.target.set(...target);
    controls.current?.update();
  }, [camera, scene]);

  useEffect(() => {
    if (!command || command.seq === handledSeq.current) return;
    handledSeq.current = command.seq;
    const target = controls.current?.target ?? new Vector3();
    if (command.kind === "goto") {
      goal.current = {
        position: new Vector3(...command.position),
        target: new Vector3(...command.target),
      };
      return;
    }
    // Orbit: rotate the current camera position around the target's up axis.
    const start = goal.current?.position ?? camera.position;
    const offset = start.clone().sub(target).applyAxisAngle(UP, command.yaw);
    goal.current = {
      position: target.clone().add(offset),
      target: target.clone(),
    };
  }, [camera, command]);

  useFrame((_, delta) => {
    const current = goal.current;
    const orbit = controls.current;
    if (!current || !orbit) return;
    const { position } = camera;
    const { target } = orbit;
    const dt = Math.min(delta, 0.1);
    dampTowards(position, current.position, dt);
    dampTowards(target, current.target, dt);
    orbit.update();
    if (
      position.distanceTo(current.position) < SETTLED &&
      target.distanceTo(current.target) < SETTLED
    ) {
      position.copy(current.position);
      target.copy(current.target);
      orbit.update();
      goal.current = null;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enabled={enabled}
      // A user drag wins over an in-flight preset move.
      onStart={() => {
        goal.current = null;
      }}
    />
  );
}
