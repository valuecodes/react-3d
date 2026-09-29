import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import {
  cellPosition,
  FACE_NAMES,
  FACES,
  facesFor,
  faceTransform,
  halfSide,
  THREE_SIDES,
} from "./formations";

const SIZE = 4;
const CELL = 2;
const H = halfSide(SIZE, CELL);

function* everyCell() {
  for (const face of FACE_NAMES) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) yield { face, x, y };
    }
  }
}

describe("FACES", () => {
  it("lists a right-handed (u, normal, v) triple per face", () => {
    for (const face of FACE_NAMES) {
      const { u, normal, v } = FACES[face];
      expect(u.clone().cross(normal).distanceTo(v)).toBeLessThan(1e-12);
      expect(u.length()).toBeCloseTo(1);
      expect(v.length()).toBeCloseTo(1);
      expect(normal.length()).toBeCloseTo(1);
    }
  });

  it("uses six distinct outward normals and net offsets", () => {
    const normals = new Set(
      FACE_NAMES.map((f) => FACES[f].normal.toArray().join())
    );
    const offsets = new Set(FACE_NAMES.map((f) => FACES[f].net.join()));
    expect(normals.size).toBe(6);
    expect(offsets.size).toBe(6);
  });

  it("facesFor picks the three-sided corner or all six", () => {
    expect(facesFor(3)).toEqual(THREE_SIDES);
    expect(facesFor(6)).toEqual(FACE_NAMES);
  });
});

describe("faceTransform", () => {
  it("cube: rotates local x, y, z onto u, normal, v", () => {
    for (const face of FACE_NAMES) {
      const { quaternion, position } = faceTransform(face, "cube", SIZE, CELL);
      const { u, normal, v } = FACES[face];
      const x = new Vector3(1, 0, 0).applyQuaternion(quaternion);
      const y = new Vector3(0, 1, 0).applyQuaternion(quaternion);
      const z = new Vector3(0, 0, 1).applyQuaternion(quaternion);
      expect(x.distanceTo(u)).toBeLessThan(1e-12);
      expect(y.distanceTo(normal)).toBeLessThan(1e-12);
      expect(z.distanceTo(v)).toBeLessThan(1e-12);
      expect(position.dot(normal)).toBeCloseTo(H);
    }
  });

  it("net: identity rotation on the plane y = H", () => {
    for (const face of FACE_NAMES) {
      const { quaternion, position } = faceTransform(face, "net", SIZE, CELL);
      expect(
        quaternion.angleTo(faceTransform("top", "net", SIZE, CELL).quaternion)
      ).toBe(0);
      expect(position.y).toBe(H);
    }
  });

  it("keeps the top face in place in both formations", () => {
    const cube = faceTransform("top", "cube", SIZE, CELL);
    const net = faceTransform("top", "net", SIZE, CELL);
    expect(cube.position.distanceTo(net.position)).toBe(0);
    expect(cube.quaternion.angleTo(net.quaternion)).toBe(0);
  });
});

describe("cellPosition", () => {
  it("folded: every centre lies on its face plane, inside the face", () => {
    for (const { face, x, y } of everyCell()) {
      const center = cellPosition(face, "cube", x, y, SIZE, CELL);
      const { normal, u, v } = FACES[face];
      expect(center.dot(normal)).toBeCloseTo(H, 10);
      expect(Math.abs(center.dot(u))).toBeLessThan(H);
      expect(Math.abs(center.dot(v))).toBeLessThan(H);
    }
  });

  it("net: every centre is at y = H and no two coincide", () => {
    const seen = new Set<string>();
    for (const { face, x, y } of everyCell()) {
      const center = cellPosition(face, "net", x, y, SIZE, CELL);
      expect(center.y).toBe(H);
      const key = `${center.x.toFixed(6)},${center.z.toFixed(6)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(6 * SIZE * SIZE);
  });

  it("folded: no two centres coincide either", () => {
    const seen = new Set<string>();
    for (const { face, x, y } of everyCell()) {
      const center = cellPosition(face, "cube", x, y, SIZE, CELL);
      seen.add(
        center
          .toArray()
          .map((n) => n.toFixed(6))
          .join()
      );
    }
    expect(seen.size).toBe(6 * SIZE * SIZE);
  });
});
