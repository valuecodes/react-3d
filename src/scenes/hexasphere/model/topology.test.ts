import { describe, expect, it } from "vitest";

import mazes from "./ReadyMazes";
import { buildIcoTopology, ringOrder } from "./topology";

describe("buildIcoTopology", () => {
  for (const detail of [0, 1, 2, 3, 4, 5]) {
    it(`detail ${detail} reproduces the r117 tile order that ReadyMazes was generated with`, () => {
      const { centers, neighbors } = buildIcoTopology(50, detail);
      const maze = mazes[detail];
      expect(maze).toBeDefined();
      if (!maze) return;

      expect(centers.length).toBe(10 * 4 ** detail + 2);
      expect(maze.length).toBe(centers.length);

      let pentagons = 0;
      let badDegree = 0;
      let unknownPassages = 0;
      maze.forEach(([passages], i) => {
        const computed = neighbors[i] ?? [];
        if (computed.length === 5) pentagons++;
        else if (computed.length !== 6) badDegree++;
        for (const j of passages) if (!computed.includes(j)) unknownPassages++;
      });

      expect(pentagons).toBe(12);
      expect(badDegree).toBe(0);
      expect(unknownPassages).toBe(0);
      // The legacy code measured `distanceToNext` between the first two tiles.
      expect(neighbors[0]).toContain(1);
    });
  }
});

describe("ringOrder", () => {
  it("orders points counter-clockwise as seen from outside", () => {
    const { centers, neighbors } = buildIcoTopology(50, 1);
    for (const [i, center] of centers.entries()) {
      const ring = neighbors[i] ?? [];
      const order = ringOrder(
        center,
        ring.map((j) => centers[j] ?? center)
      );
      expect(order).toHaveLength(ring.length);
      expect(new Set(order).size).toBe(ring.length);
      for (let k = 0; k < order.length; k++) {
        const a = centers[ring[order[k] ?? 0] ?? 0] ?? center;
        const b =
          centers[ring[order[(k + 1) % order.length] ?? 0] ?? 0] ?? center;
        const cross = a.clone().sub(center).cross(b.clone().sub(center));
        expect(cross.dot(center)).toBeGreaterThan(0);
      }
    }
  });
});
