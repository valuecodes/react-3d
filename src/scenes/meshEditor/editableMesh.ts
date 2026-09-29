import { BoxGeometry, BufferAttribute } from "three";
import type { BufferGeometry, Vector3 } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { at, invariant } from "../../lib/invariant";
import { buildTopology } from "./topology";
import type { MeshTopology } from "./topology";

/**
 * An indexed geometry whose vertices can be moved. Every position write goes
 * through here so the attribute upload, normals and bounds stay consistent.
 */
export class EditableMesh {
  readonly topology: MeshTopology;
  /** The untouched positions, for `reset()`. */
  readonly original: Float32Array;
  private readonly position: BufferAttribute;

  constructor(readonly geometry: BufferGeometry) {
    this.topology = buildTopology(geometry);
    const position = geometry.getAttribute("position");
    invariant(
      position instanceof BufferAttribute,
      "EditableMesh needs a non-interleaved position attribute"
    );
    this.position = position;
    this.original = new Float32Array(position.array);
  }

  /** A copy of the current positions: the base a drag is measured from. */
  snapshot(): Float32Array {
    return new Float32Array(this.position.array);
  }

  /**
   * Writes `base + delta` for the given vertices, so calling it repeatedly
   * from the same snapshot never accumulates.
   */
  translate(
    vertices: readonly number[],
    base: Float32Array,
    delta: Vector3
  ): void {
    for (const i of vertices) {
      const o = i * 3;
      this.position.setXYZ(
        i,
        at(base, o) + delta.x,
        at(base, o + 1) + delta.y,
        at(base, o + 2) + delta.z
      );
    }
    this.commit();
  }

  reset(): void {
    this.position.copyArray(this.original);
    this.commit();
  }

  dispose(): void {
    this.geometry.dispose();
  }

  private commit(): void {
    this.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
  }
}

/**
 * A box with its 8 corners shared between faces. `mergeVertices` hashes every
 * attribute, so the per-face normals and uvs go first; normals come back from
 * `computeVertexNormals` and are smooth across the shared corners.
 */
export function createEditableBox(size: number): EditableMesh {
  const box = new BoxGeometry(size, size, size);
  box.deleteAttribute("normal");
  box.deleteAttribute("uv");
  const merged = mergeVertices(box);
  box.dispose();
  merged.computeVertexNormals();
  return new EditableMesh(merged);
}
