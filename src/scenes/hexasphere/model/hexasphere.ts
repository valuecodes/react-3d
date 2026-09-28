import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Vector3,
} from "three";

import { at, invariant } from "../../../lib/invariant";
import { COLOR_INDEX, COLOR_KEYS, WALL } from "../options";
import type { ColorIndex, SphereOptions } from "../options";
import { buildPalette, ColorPainter } from "./painter";
import mazes from "./ReadyMazes";
import { Tile } from "./tile";
import { buildIcoTopology, ringOrder } from "./topology";

export type Hexasphere = {
  tiles: Tile[];
  /** Tile owning each triangle of `tileGeometry`; `event.faceIndex` indexes it directly. */
  faceToTile: Tile[];
  tileGeometry: BufferGeometry;
  wallGeometry: BufferGeometry;
  distanceToNext: number;
  dispose(): void;
};

type Buffers = {
  position: Float32Array;
  normal: Float32Array;
  color: Float32Array;
  colorAttribute: BufferAttribute;
};

/**
 * Builds the two meshes of the sphere as non-indexed geometries with RGBA
 * vertex colours: one for the tiles (a triangle fan per tile) and one for the
 * walls (a quad per tile edge). Tile ids follow the r117 vertex order that
 * `ReadyMazes.js` was generated with.
 */
export function createHexasphere(options: SphereOptions): Hexasphere {
  const { centers, neighbors } = buildIcoTopology(options.size, options.detail);
  invariant(centers.length >= 2, "A hexasphere needs at least two tiles");
  const distanceToNext = at(centers, 0).distanceTo(at(centers, 1));

  // Neighbour ids ordered counter-clockwise, and one corner between each consecutive pair.
  const rings = centers.map((center, i) => {
    const ids = at(neighbors, i);
    return ringOrder(
      center,
      ids.map((j) => at(centers, j))
    ).map((k) => at(ids, k));
  });
  const corners = rings.map((ring, i) =>
    ring.map((_, k) =>
      centroid(
        at(centers, i),
        at(centers, at(ring, k)),
        at(centers, at(ring, (k + 1) % ring.length))
      )
    )
  );

  let triTotal = 0;
  let wallTriTotal = 0;
  for (const tileCorners of corners) {
    triTotal += tileCorners.length - 2;
    wallTriTotal += tileCorners.length * 2;
  }

  const tileBuffers = allocate(triTotal);
  const wallBuffers = allocate(wallTriTotal);
  const tilePainter = new ColorPainter(
    tileBuffers.color,
    tileBuffers.colorAttribute,
    buildPalette(COLOR_KEYS.map((key) => options.colorScheme[key]))
  );
  const wallPainter = new ColorPainter(
    wallBuffers.color,
    wallBuffers.colorAttribute,
    buildPalette([
      options.wallColors.unvisited,
      options.wallColors.visited,
      options.wallColors.notVisible,
    ])
  );

  const tiles: Tile[] = [];
  const faceToTile: Tile[] = [];
  const pull = 2 ** -options.wallWidth;
  let tri = 0;
  let wallTri = 0;

  for (let i = 0; i < centers.length; i++) {
    const center = at(centers, i);
    const tileCorners = at(corners, i);
    const n = tileCorners.length;
    const isPentagon = n === 5;
    const tile = new Tile(
      i,
      center,
      isPentagon,
      tileCorners,
      tri,
      n - 2,
      wallTri,
      baseColorIndex(center, isPentagon, distanceToNext, options),
      tilePainter,
      wallPainter
    );
    const normal = center.clone().normalize();

    for (let k = 1; k + 1 < n; k++) {
      writeTriangle(
        tileBuffers,
        tri,
        at(tileCorners, 0),
        at(tileCorners, k),
        at(tileCorners, k + 1),
        normal
      );
      faceToTile.push(tile);
      tri++;
    }

    for (let k = 0; k < n; k++) {
      const a = at(tileCorners, k);
      const b = at(tileCorners, (k + 1) % n);
      const innerA = a.clone().lerp(center, pull);
      const innerB = b.clone().lerp(center, pull);
      writeTriangle(wallBuffers, wallTri, innerA, a, b, normal);
      writeTriangle(wallBuffers, wallTri + 1, innerA, b, innerB, normal);
      wallTri += 2;
    }

    tile.setColor(tile.baseColor);
    tile.setWallColors(WALL.unvisited);
    tiles.push(tile);
  }

  tiles.forEach((tile, i) => {
    const ring = at(rings, i);
    tile.neighbors = ring.map((j) => at(tiles, j));
    // Corner k is shared with neighbours k and k+1, so the wall between corners k and k+1 faces neighbour k+1.
    tile.wallToNeighbor = ring.map((_, k) =>
      at(tiles, at(ring, (k + 1) % ring.length))
    );
  });

  const tileGeometry = toGeometry(tileBuffers);
  const wallGeometry = toGeometry(wallBuffers);
  const hexasphere: Hexasphere = {
    tiles,
    faceToTile,
    tileGeometry,
    wallGeometry,
    distanceToNext,
    dispose() {
      tileGeometry.dispose();
      wallGeometry.dispose();
    },
  };

  if (options.obstacles) addObstacles(hexasphere);
  return hexasphere;
}

/** Marks roughly 30% of the tiles as obstacles and clears start and target. */
export function addObstacles({ tiles }: Hexasphere): void {
  for (const tile of tiles) {
    tile.obstacle = false;
    tile.start = false;
    tile.target = false;
    tile.setColor(tile.baseColor);
    if (Math.random() < 0.3) {
      tile.obstacle = true;
      tile.setColor(COLOR_INDEX.obstacle);
      tile.setWallColors(WALL.visited);
    }
  }
}

export function clearObstacles({ tiles }: Hexasphere): void {
  for (const tile of tiles) {
    tile.obstacle = false;
    tile.start = false;
    tile.target = false;
    tile.setColor(tile.baseColor);
    tile.setWallColors(WALL.unvisited);
  }
}

/** Returns every tile to its initial state: base colour, all walls closed and unvisited, no search data. */
export function resetHexasphere({ tiles }: Hexasphere): void {
  for (const tile of tiles) {
    tile.obstacle = false;
    tile.start = false;
    tile.target = false;
    tile.visited = false;
    tile.f = 0;
    tile.g = 0;
    tile.h = 0;
    tile.previous = null;
    tile.availableNeighbors = [];
    tile.setColor(tile.baseColor);
    tile.setWallColors(WALL.unvisited);
  }
}

/** Opens the passages of the precomputed maze for `detail`. Walls must already be painted. */
export function applyReadyMaze({ tiles }: Hexasphere, detail: number): void {
  const maze = mazes[detail];
  invariant(
    maze && maze.length === tiles.length,
    `No precomputed maze for detail ${detail}`
  );
  tiles.forEach((tile, i) => {
    const [neighborIds] = at(maze, i);
    tile.availableNeighbors = neighborIds.map((id) => at(tiles, id));
    tile.wallOpen = tile.wallToNeighbor.map((neighbor) =>
      tile.availableNeighbors.includes(neighbor)
    );
    tile.setWalls();
  });
}

function baseColorIndex(
  center: Vector3,
  isPentagon: boolean,
  distanceToNext: number,
  { colorScheme, detail }: SphereOptions
): ColorIndex {
  // A single `color` overrides the per-region scheme.
  if (colorScheme.color) return COLOR_INDEX.color;
  if (isPentagon) return COLOR_INDEX.pentagon;

  const seamWidth =
    distanceToNext * (detail === 3 ? 0.87 : detail > 5 ? 2.1 : 0.8);
  const { x, y, z } = center;
  if (
    Math.abs(x) < seamWidth ||
    Math.abs(y) < seamWidth ||
    Math.abs(z) < seamWidth
  ) {
    return COLOR_INDEX.seam;
  }

  if (z > 0) {
    if (y > 0) return x > 0 ? COLOR_INDEX.q1 : COLOR_INDEX.q2;
    return x > 0 ? COLOR_INDEX.q4 : COLOR_INDEX.q3;
  }
  if (y > 0) return x > 0 ? COLOR_INDEX.q5 : COLOR_INDEX.q8;
  return x > 0 ? COLOR_INDEX.q7 : COLOR_INDEX.q6;
}

function centroid(a: Vector3, b: Vector3, c: Vector3): Vector3 {
  return new Vector3(
    (a.x + b.x + c.x) / 3,
    (a.y + b.y + c.y) / 3,
    (a.z + b.z + c.z) / 3
  );
}

function allocate(triCount: number): Buffers {
  const color = new Float32Array(triCount * 12);
  const colorAttribute = new BufferAttribute(color, 4);
  colorAttribute.setUsage(DynamicDrawUsage);
  return {
    position: new Float32Array(triCount * 9),
    normal: new Float32Array(triCount * 9),
    color,
    colorAttribute,
  };
}

function writeTriangle(
  buffers: Buffers,
  tri: number,
  p0: Vector3,
  p1: Vector3,
  p2: Vector3,
  normal: Vector3
): void {
  const o = tri * 9;
  buffers.position.set(
    [p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z],
    o
  );
  buffers.normal.set(
    [
      normal.x,
      normal.y,
      normal.z,
      normal.x,
      normal.y,
      normal.z,
      normal.x,
      normal.y,
      normal.z,
    ],
    o
  );
}

function toGeometry(buffers: Buffers): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(buffers.position, 3));
  geometry.setAttribute("normal", new BufferAttribute(buffers.normal, 3));
  geometry.setAttribute("color", buffers.colorAttribute);
  geometry.computeBoundingSphere();
  return geometry;
}
