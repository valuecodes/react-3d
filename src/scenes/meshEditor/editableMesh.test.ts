import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { at } from "../../lib/invariant";
import { createEditableBox } from "./editableMesh";

function positions(mesh: ReturnType<typeof createEditableBox>): Float32Array {
  return mesh.snapshot();
}

describe("EditableMesh", () => {
  it("moves only the selected vertices", () => {
    const mesh = createEditableBox(10);
    const base = mesh.snapshot();
    mesh.translate([1, 3], base, new Vector3(2, 0, -1));
    const after = positions(mesh);
    for (let i = 0; i < mesh.topology.vertexCount; i++) {
      const o = i * 3;
      const expected =
        i === 1 || i === 3
          ? [at(base, o) + 2, at(base, o + 1), at(base, o + 2) - 1]
          : [at(base, o), at(base, o + 1), at(base, o + 2)];
      expect([at(after, o), at(after, o + 1), at(after, o + 2)]).toEqual(
        expected
      );
    }
  });

  it("applies the delta from the snapshot so repeated calls do not accumulate", () => {
    const mesh = createEditableBox(10);
    const base = mesh.snapshot();
    const delta = new Vector3(0, 4, 0);
    mesh.translate([0], base, delta);
    mesh.translate([0], base, delta);
    mesh.translate([0], base, delta);
    const after = positions(mesh);
    expect(at(after, 1)).toBe(at(base, 1) + 4);
  });

  it("reset restores the original buffer and flags the upload", () => {
    const mesh = createEditableBox(10);
    const original = new Float32Array(mesh.original);
    mesh.translate([0, 1, 2], mesh.snapshot(), new Vector3(3, 3, 3));
    expect(positions(mesh)).not.toEqual(original);
    mesh.reset();
    expect(positions(mesh)).toEqual(original);
    expect(mesh.original).toEqual(original);
  });

  it("recomputes normals after a move", () => {
    const mesh = createEditableBox(10);
    const normal = mesh.geometry.getAttribute("normal");
    // An area-weighted normal does not depend on the vertex's own position
    // (the terms cancel around its closed neighbour loop), so watch a
    // neighbour of the moved corner instead.
    const neighbour = mesh.topology.faces[0]?.b ?? -1;
    expect(neighbour).toBeGreaterThanOrEqual(0);
    const before = new Vector3().fromBufferAttribute(normal, neighbour);
    mesh.translate([0], mesh.snapshot(), new Vector3(8, 3, 0));
    const after = new Vector3().fromBufferAttribute(normal, neighbour);
    expect(after.equals(before)).toBe(false);
    expect(mesh.geometry.boundingSphere?.radius ?? 0).toBeGreaterThan(
      Math.sqrt(75)
    );
  });
});
