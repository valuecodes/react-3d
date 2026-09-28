import { Color } from "three";
import type { BufferAttribute } from "three";

import { at } from "../../../../../../lib/invariant";

/** RGBA palette, four floats per entry. Empty or null colours become fully transparent. */
export function buildPalette(
  colors: readonly (string | null | undefined)[]
): Float32Array {
  const palette = new Float32Array(colors.length * 4);
  colors.forEach((value, index) => {
    if (!value) return; // alpha stays 0
    const color = new Color(value);
    palette.set([color.r, color.g, color.b, 1], index * 4);
  });
  return palette;
}

/**
 * Writes palette entries into a non-indexed geometry's RGBA `color` attribute,
 * one triangle (three vertices) at a time.
 */
export class ColorPainter {
  constructor(
    private readonly data: Float32Array,
    private readonly attribute: BufferAttribute,
    private readonly palette: Float32Array
  ) {}

  fillTriangles(start: number, count: number, paletteIndex: number): void {
    const p = paletteIndex * 4;
    const r = at(this.palette, p);
    const g = at(this.palette, p + 1);
    const b = at(this.palette, p + 2);
    const a = at(this.palette, p + 3);
    const end = (start + count) * 3;
    for (let vertex = start * 3; vertex < end; vertex++) {
      const o = vertex * 4;
      this.data[o] = r;
      this.data[o + 1] = g;
      this.data[o + 2] = b;
      this.data[o + 3] = a;
    }
    this.attribute.needsUpdate = true;
  }
}
