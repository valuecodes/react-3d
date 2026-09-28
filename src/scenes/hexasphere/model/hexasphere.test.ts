import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { at } from "../../../lib/invariant";
import { initialOptions } from "../options";
import type { SphereOptions } from "../options";
import {
  applyReadyMaze,
  createHexasphere,
  resetHexasphere,
} from "./hexasphere";

const DETAIL = 2;
const options: SphereOptions = { ...initialOptions.sphere, detail: DETAIL };

function triangleCentroid(positions: ArrayLike<number>, tri: number): Vector3 {
  const o = tri * 9;
  return new Vector3(
    (at(positions, o) + at(positions, o + 3) + at(positions, o + 6)) / 3,
    (at(positions, o + 1) + at(positions, o + 4) + at(positions, o + 7)) / 3,
    (at(positions, o + 2) + at(positions, o + 5) + at(positions, o + 8)) / 3
  );
}

describe("createHexasphere", () => {
  const hexasphere = createHexasphere(options);
  const { tiles, faceToTile, tileGeometry, wallGeometry } = hexasphere;

  it("maps every tile triangle back to its tile", () => {
    expect(faceToTile).toHaveLength(
      tileGeometry.getAttribute("position").count / 3
    );
    tiles.forEach((tile) => {
      for (let t = tile.triStart; t < tile.triStart + tile.triCount; t++) {
        expect(faceToTile[t]).toBe(tile);
      }
    });
  });

  it("allocates two wall triangles per corner", () => {
    const expected = tiles.reduce((sum, tile) => sum + 2 * tile.wallCount, 0);
    expect(wallGeometry.getAttribute("position").count / 3).toBe(expected);
    expect(tiles.filter((tile) => tile.isPentagon)).toHaveLength(12);
  });

  it("winds every triangle outward", () => {
    const positions = tileGeometry.getAttribute("position").array;
    const p = new Vector3();
    const q = new Vector3();
    for (let t = 0; t < faceToTile.length; t++) {
      const o = t * 9;
      const a = new Vector3(
        at(positions, o),
        at(positions, o + 1),
        at(positions, o + 2)
      );
      p.set(
        at(positions, o + 3),
        at(positions, o + 4),
        at(positions, o + 5)
      ).sub(a);
      q.set(
        at(positions, o + 6),
        at(positions, o + 7),
        at(positions, o + 8)
      ).sub(a);
      expect(p.cross(q).dot(a)).toBeGreaterThan(0);
    }
  });

  it("maps walls to neighbours symmetrically, on the shared edge", () => {
    const wallPositions = wallGeometry.getAttribute("position").array;
    for (const tile of tiles) {
      expect(tile.wallToNeighbor).toHaveLength(tile.wallCount);
      for (const neighbor of tile.neighbors) {
        const k = tile.wallFacing(neighbor);
        const back = neighbor.wallFacing(tile);
        expect(k).toBeDefined();
        expect(back).toBeDefined();
        if (k === undefined || back === undefined) continue;
        // Both wall quads lie on the same edge, so their outer triangles share a midpoint.
        const mine = triangleCentroid(wallPositions, tile.wallTriStart + 2 * k);
        const theirs = triangleCentroid(
          wallPositions,
          neighbor.wallTriStart + 2 * back
        );
        expect(mine.distanceTo(theirs)).toBeLessThan(
          hexasphere.distanceToNext * 0.2
        );
        // And the edge sits between the two centres.
        const midpoint = tile.center
          .clone()
          .add(neighbor.center)
          .multiplyScalar(0.5);
        expect(mine.distanceTo(midpoint)).toBeLessThan(
          hexasphere.distanceToNext * 0.2
        );
      }
    }
  });

  it("opens exactly the precomputed passages", () => {
    applyReadyMaze(hexasphere, DETAIL);
    for (const tile of tiles) {
      const openWalls = tile.wallOpen.filter(Boolean).length;
      expect(openWalls).toBe(tile.availableNeighbors.length);
      tile.wallToNeighbor.forEach((neighbor, k) => {
        expect(tile.wallOpen[k]).toBe(
          tile.availableNeighbors.includes(neighbor)
        );
        // Passages are symmetric.
        if (tile.wallOpen[k])
          expect(neighbor.availableNeighbors).toContain(tile);
      });
    }
  });

  it("reset clears passages, markers and search data", () => {
    const first = at(tiles, 0);
    first.start = true;
    first.visited = true;
    first.previous = at(tiles, 1);
    resetHexasphere(hexasphere);
    for (const tile of tiles) {
      expect(tile.availableNeighbors).toHaveLength(0);
      expect(tile.wallOpen.some(Boolean)).toBe(false);
      expect(tile.visited).toBe(false);
      expect(tile.start).toBe(false);
      expect(tile.previous).toBeNull();
    }
  });
});
