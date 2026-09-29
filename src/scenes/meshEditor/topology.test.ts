import { BoxGeometry, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { at } from "../../lib/invariant";
import { createEditableBox } from "./editableMesh";
import { buildTopology } from "./topology";

describe("buildTopology", () => {
  const { topology } = createEditableBox(10);

  it("counts a merged box as 8 vertices, 12 triangles and 18 unique edges", () => {
    expect(topology.vertexCount).toBe(8);
    expect(topology.faces).toHaveLength(12);
    expect(topology.edges).toHaveLength(18);
  });

  it("stores edges with a < b and no duplicates", () => {
    const keys = new Set<string>();
    for (const { a, b } of topology.edges) {
      expect(a).toBeLessThan(b);
      keys.add(`${a}-${b}`);
    }
    expect(keys.size).toBe(18);
  });

  it("returns 3 distinct vertices for a face and 2 for an edge", () => {
    const face = topology.verticesOf({ kind: "face", index: 0 });
    expect(face).toHaveLength(3);
    expect(new Set(face).size).toBe(3);
    const edge = topology.verticesOf({ kind: "edge", index: 0 });
    expect(edge).toHaveLength(2);
    expect(new Set(edge).size).toBe(2);
    expect(topology.verticesOf({ kind: "vertex", index: 5 })).toEqual([5]);
    expect(topology.verticesOf(null)).toEqual([]);
  });

  it("anchors a vertex at its position and an edge at its midpoint", () => {
    const out = new Vector3();
    const vertex = topology.anchorOf({ kind: "vertex", index: 2 }, out).clone();
    expect(vertex.equals(topology.vertexPosition(2, out))).toBe(true);

    const edge = at(topology.edges, 0);
    const a = topology.vertexPosition(edge.a, new Vector3());
    const b = topology.vertexPosition(edge.b, new Vector3());
    const midpoint = topology.anchorOf({ kind: "edge", index: 0 }, out);
    expect(midpoint.distanceTo(a.add(b).multiplyScalar(0.5))).toBeLessThan(
      1e-6
    );
    expect(topology.anchorOf(null, out).length()).toBe(0);
  });

  it("puts every face centroid on a face of the box", () => {
    const out = new Vector3();
    for (let f = 0; f < topology.faces.length; f++) {
      topology.faceCentroid(f, out);
      const onFace = [out.x, out.y, out.z].some(
        (c) => Math.abs(Math.abs(c) - 5) < 1e-6
      );
      expect(onFace).toBe(true);
    }
  });

  it("refuses a non-indexed geometry", () => {
    const box = new BoxGeometry(1, 1, 1).toNonIndexed();
    expect(() => buildTopology(box)).toThrow(/indexed/);
  });
});
