import { Vector3 } from "three";
import type {
  BufferAttribute,
  BufferGeometry,
  InterleavedBufferAttribute,
} from "three";

import { at, invariant } from "../../lib/invariant";

export type ElementKind = "vertex" | "edge" | "face";

export type Selection = { kind: ElementKind; index: number } | null;

export type Face = { a: number; b: number; c: number };
/** An undirected edge, stored with `a < b`. */
export type Edge = { a: number; b: number };

/**
 * The vertices, unique edges and triangles of an indexed geometry, plus
 * position lookups that read the live `position` attribute so they stay
 * correct while vertices are being dragged.
 */
export type MeshTopology = {
  vertexCount: number;
  faces: readonly Face[];
  edges: readonly Edge[];
  vertexPosition: (index: number, out: Vector3) => Vector3;
  faceCentroid: (face: number, out: Vector3) => Vector3;
  edgeMidpoint: (edge: number, out: Vector3) => Vector3;
  /** The vertex indices a selection moves; empty for no selection. */
  verticesOf: (selection: Selection) => readonly number[];
  /** Where the gizmo sits for a selection: the vertex, the edge midpoint or the face centroid. */
  anchorOf: (selection: Selection, out: Vector3) => Vector3;
};

const _a = new Vector3();
const _b = new Vector3();

export function buildTopology(geometry: BufferGeometry): MeshTopology {
  const index = geometry.getIndex();
  invariant(index, "buildTopology needs an indexed geometry");
  // The attribute map is typed without `undefined`; the runtime lookup can still miss.
  const position: BufferAttribute | InterleavedBufferAttribute | undefined =
    geometry.getAttribute("position");
  invariant(position, "buildTopology needs a position attribute");

  const vertexCount = position.count;
  const faces: Face[] = [];
  const edges: Edge[] = [];
  const seen = new Set<number>();
  const addEdge = (i: number, j: number) => {
    const a = Math.min(i, j);
    const b = Math.max(i, j);
    const key = a * vertexCount + b;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b });
  };

  for (let t = 0; t < index.count; t += 3) {
    const a = index.getX(t);
    const b = index.getX(t + 1);
    const c = index.getX(t + 2);
    faces.push({ a, b, c });
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  const vertexPosition = (i: number, out: Vector3): Vector3 =>
    out.fromBufferAttribute(position, i);

  const faceCentroid = (f: number, out: Vector3): Vector3 => {
    const face = at(faces, f);
    vertexPosition(face.a, out);
    out.add(vertexPosition(face.b, _a));
    out.add(vertexPosition(face.c, _b));
    return out.divideScalar(3);
  };

  const edgeMidpoint = (e: number, out: Vector3): Vector3 => {
    const edge = at(edges, e);
    vertexPosition(edge.a, out);
    return out.add(vertexPosition(edge.b, _a)).multiplyScalar(0.5);
  };

  const verticesOf = (selection: Selection): readonly number[] => {
    if (!selection) return [];
    switch (selection.kind) {
      case "vertex":
        return [selection.index];
      case "edge": {
        const edge = at(edges, selection.index);
        return [edge.a, edge.b];
      }
      case "face": {
        const face = at(faces, selection.index);
        return [face.a, face.b, face.c];
      }
    }
  };

  const anchorOf = (selection: Selection, out: Vector3): Vector3 => {
    if (!selection) return out.set(0, 0, 0);
    switch (selection.kind) {
      case "vertex":
        return vertexPosition(selection.index, out);
      case "edge":
        return edgeMidpoint(selection.index, out);
      case "face":
        return faceCentroid(selection.index, out);
    }
  };

  return {
    vertexCount,
    faces,
    edges,
    vertexPosition,
    faceCentroid,
    edgeMidpoint,
    verticesOf,
    anchorOf,
  };
}
