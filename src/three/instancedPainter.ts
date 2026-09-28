import type { Color, InstancedMesh } from "three";

import { at } from "../lib/invariant";

/** The only way instance colours change: keeps `instanceColor` uploads in one place. */
export class InstancedPainter {
  constructor(
    readonly mesh: InstancedMesh,
    readonly palette: readonly Color[]
  ) {}

  set(instance: number, paletteIndex: number): void {
    this.mesh.setColorAt(instance, at(this.palette, paletteIndex));
    this.flag();
  }

  fill(paletteIndex: number): void {
    const color = at(this.palette, paletteIndex);
    for (let i = 0; i < this.mesh.count; i++) this.mesh.setColorAt(i, color);
    this.flag();
  }

  private flag(): void {
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
