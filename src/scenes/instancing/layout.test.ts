import { describe, expect, it } from "vitest";

import {
  cellOf,
  instancePosition,
  WAVE_LENGTH,
  WAVE_SPEED,
  waveHeight,
} from "./layout";

describe("cellOf", () => {
  it("walks the grid row by row", () => {
    expect(cellOf(0, 10)).toEqual({ col: 0, row: 0 });
    expect(cellOf(9, 10)).toEqual({ col: 9, row: 0 });
    expect(cellOf(10, 10)).toEqual({ col: 0, row: 1 });
    expect(cellOf(99, 10)).toEqual({ col: 9, row: 9 });
  });
});

describe("instancePosition", () => {
  it("centres the grid on the origin", () => {
    const side = 4;
    const spacing = 5;
    const corners = [
      instancePosition(0, 0, side, spacing),
      instancePosition(side - 1, side - 1, side, spacing),
    ];
    expect(corners[0]).toEqual({ x: -7.5, z: -7.5 });
    expect(corners[1]).toEqual({ x: 7.5, z: 7.5 });

    let sumX = 0;
    let sumZ = 0;
    for (let i = 0; i < side * side; i++) {
      const { col, row } = cellOf(i, side);
      const { x, z } = instancePosition(col, row, side, spacing);
      sumX += x;
      sumZ += z;
    }
    expect(sumX).toBeCloseTo(0);
    expect(sumZ).toBeCloseTo(0);
  });

  it("puts the middle cell of an odd grid exactly at the origin", () => {
    expect(instancePosition(2, 2, 5, 3)).toEqual({ x: 0, z: 0 });
  });

  it("spaces neighbours by `spacing`", () => {
    const a = instancePosition(3, 7, 20, 2.5);
    const b = instancePosition(4, 7, 20, 2.5);
    const c = instancePosition(3, 8, 20, 2.5);
    expect(b.x - a.x).toBeCloseTo(2.5);
    expect(c.z - a.z).toBeCloseTo(2.5);
  });
});

describe("waveHeight", () => {
  it("is flat when the amplitude is zero", () => {
    // `0 * sin(negative)` is -0, which `toBe` would tell apart from 0.
    expect(waveHeight(3, 4, 1.7, 0)).toBeCloseTo(0);
    expect(waveHeight(9, 1, 0.2, 0)).toBeCloseTo(0);
  });

  it("never exceeds the amplitude", () => {
    for (let t = 0; t < 10; t += 0.37) {
      for (let i = 0; i < 400; i++) {
        const { col, row } = cellOf(i, 20);
        expect(Math.abs(waveHeight(col, row, t, 8))).toBeLessThanOrEqual(8);
      }
    }
  });

  it("repeats after one period in time and one wave length in space", () => {
    const period = (2 * Math.PI) / WAVE_SPEED;
    expect(waveHeight(5, 2, 0.4 + period, 6)).toBeCloseTo(
      waveHeight(5, 2, 0.4, 6)
    );
    expect(waveHeight(5 + WAVE_LENGTH, 2, 0.4, 6)).toBeCloseTo(
      waveHeight(5, 2, 0.4, 6)
    );
  });

  it("travels: the next cell shows the same height a moment later", () => {
    const k = (2 * Math.PI) / WAVE_LENGTH;
    const delay = k / WAVE_SPEED;
    expect(waveHeight(6, 3, 1 + delay, 5)).toBeCloseTo(waveHeight(5, 3, 1, 5));
  });
});
