import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Line,
  LineBasicMaterial,
} from "three";
import type { Vector3 } from "three";

import { at } from "../../../../../../lib/invariant";

export type PathLine = {
  object: Line;
  /** Draws a polyline through the given centres; an empty list clears it. */
  setPath(points: readonly { center: Vector3 }[]): void;
  dispose(): void;
};

/**
 * A line with a preallocated position buffer. Modern `setFromPoints` truncates
 * when a path outgrows the attribute, so the buffer is sized for the longest
 * possible path up front and only the draw range changes.
 */
export function createPathLine(capacity: number, color: string): PathLine {
  const size = Math.max(capacity, 1);
  const positions = new Float32Array(size * 3);
  const attribute = new BufferAttribute(positions, 3);
  attribute.setUsage(DynamicDrawUsage);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", attribute);
  geometry.setDrawRange(0, 0);

  const material = new LineBasicMaterial({ color });
  const object = new Line(geometry, material);
  object.frustumCulled = false;

  return {
    object,
    setPath(points) {
      const count = Math.min(points.length, size);
      for (let i = 0; i < count; i++) {
        const { center } = at(points, i);
        positions[3 * i] = center.x;
        positions[3 * i + 1] = center.y;
        positions[3 * i + 2] = center.z;
      }
      attribute.needsUpdate = true;
      geometry.setDrawRange(0, count);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
