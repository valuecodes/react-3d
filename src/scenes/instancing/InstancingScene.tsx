import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Color, Object3D } from "three";
import type { InstancedMesh } from "three";

import { InstancedPainter } from "../../three/instancedPainter";
import { useInstancing } from "./InstancingProvider";
import { cellOf, instancePosition, waveHeight } from "./layout";

const CYLINDER_HEIGHT = 2;
const CYLINDER_SEGMENTS = 12;

/** Alternating instance colours, as in the original demo. */
const PALETTE: readonly Color[] = [new Color("#66ff66"), new Color("#888888")];

/** Scratch transform: every instance matrix is composed through it. */
const scratch = new Object3D();

/** A `side * side` grid of cylinders drawn as one instanced mesh, optionally rippling. */
export function InstancingScene() {
  const { options } = useInstancing();
  const { side, spacing, animate, amplitude } = options;
  const count = side * side;
  const radius = spacing * 0.35;
  const mesh = useRef<InstancedMesh>(null);
  // Ground positions (x, z per instance), filled by the layout effect so the
  // frame loop allocates nothing.
  const ground = useRef(new Float32Array(0));

  // Lay the grid out flat and colour it. Runs again whenever the grid is
  // rebuilt (the `key` below remounts the mesh when `count` changes) or the
  // animation is switched off, which returns every cylinder to the ground.
  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const painter = new InstancedPainter(target, PALETTE);
    const positions = new Float32Array(target.count * 2);
    for (let i = 0; i < target.count; i++) {
      const { col, row } = cellOf(i, side);
      const { x, z } = instancePosition(col, row, side, spacing);
      positions[2 * i] = x;
      positions[2 * i + 1] = z;
      scratch.position.set(x, 0, z);
      scratch.updateMatrix();
      target.setMatrixAt(i, scratch.matrix);
      painter.set(i, (col + row) % 2);
    }
    ground.current = positions;
    target.instanceMatrix.needsUpdate = true;
  }, [side, spacing, animate]);

  useFrame(({ clock }) => {
    const target = mesh.current;
    const positions = ground.current;
    if (!target || !animate || positions.length < target.count * 2) return;
    const time = clock.elapsedTime;
    for (let i = 0; i < target.count; i++) {
      const col = i % side;
      const row = (i - col) / side;
      scratch.position.set(
        positions[2 * i] ?? 0,
        waveHeight(col, row, time, amplitude),
        positions[2 * i + 1] ?? 0
      );
      scratch.updateMatrix();
      target.setMatrixAt(i, scratch.matrix);
    }
    target.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      key={count}
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <cylinderGeometry
        args={[radius, radius, CYLINDER_HEIGHT, CYLINDER_SEGMENTS]}
      />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
