import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { PathCursor } from "./pathCursor";

const point = (x: number) => ({ center: new Vector3(x, 0, 0) });

describe("PathCursor", () => {
  it("interpolates along the path and reports progress", () => {
    const cursor = new PathCursor();
    cursor.setPath([point(0), point(10), point(20)]);
    const out = new Vector3();
    expect(cursor.progress).toBe(0);
    expect(cursor.advance(0.5)).toBe(false);
    expect(cursor.position(out).x).toBeCloseTo(5);
    expect(cursor.progress).toBeCloseTo(0.25);
    expect(cursor.advance(5)).toBe(true);
    expect(cursor.position(out).x).toBeCloseTo(20);
    expect(cursor.progress).toBe(1);
  });

  it("is done immediately on an empty or single-point path", () => {
    const cursor = new PathCursor();
    expect(cursor.done).toBe(true);
    cursor.setPath([point(3)]);
    expect(cursor.advance(1)).toBe(true);
    expect(cursor.position(new Vector3()).x).toBe(3);
  });
});
