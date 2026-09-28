import type { Vector3 } from "three";

import type { Positioned } from "../lib/graph/graphNode";
import { at } from "../lib/invariant";

/** Walks a polyline from its first point to its last; the scene lerps a marker to `position()`. */
export class PathCursor {
  private points: Vector3[] = [];
  /** Fractional index along `points`. */
  private t = 0;

  /** 0..1 along the path; 1 when there is nothing to walk. */
  get progress(): number {
    const last = this.points.length - 1;
    return last <= 0 ? 1 : this.t / last;
  }

  get done(): boolean {
    return this.t >= this.points.length - 1;
  }

  /** Points in walking order (start first). */
  setPath(points: readonly Positioned[]): void {
    this.points = points.map((point) => point.center.clone());
    this.t = 0;
  }

  /** Advances by `step` points. Returns true once the end is reached. */
  advance(step: number): boolean {
    const last = Math.max(this.points.length - 1, 0);
    this.t = Math.min(this.t + step, last);
    return this.done;
  }

  position(out: Vector3): Vector3 {
    if (this.points.length === 0) return out.set(0, 0, 0);
    const index = Math.floor(this.t);
    const from = at(this.points, Math.min(index, this.points.length - 1));
    const to = this.points[index + 1];
    if (!to) return out.copy(from);
    return out.copy(from).lerp(to, this.t - index);
  }
}
