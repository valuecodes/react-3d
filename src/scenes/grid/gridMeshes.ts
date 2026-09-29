import {
  BoxGeometry,
  Color,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
} from "three";

import { at } from "../../lib/invariant";
import { InstancedPainter } from "../../three/instancedPainter";
import type { PathCursor } from "../../three/pathCursor";
import { cellCenter, OPPOSITE, SIDES } from "./grid";
import type { Grid, GridCell, GridVariant, Side } from "./grid";

export type GridScheme = {
  cell: string;
  obstacle: string;
  /** Cells the maze walker has been through. */
  visited: string;
  current: string;
  openSet: string;
  closedSet: string;
  path: string;
  start: string;
  target: string;
  wall: string;
  pathLine: string;
  tracker: string;
};

/** The legacy scenes' colours, one set per variant. */
export const GRID_SCHEMES: Record<GridVariant, GridScheme> = {
  astar: {
    cell: "whitesmoke",
    obstacle: "#111111",
    visited: "whitesmoke",
    current: "purple",
    openSet: "seagreen",
    closedSet: "khaki",
    path: "midnightblue",
    start: "gold",
    target: "red",
    wall: "#1a1a1a",
    pathLine: "red",
    tracker: "red",
  },
  maze: {
    cell: "white",
    obstacle: "#111111",
    visited: "red",
    current: "purple",
    openSet: "seagreen",
    closedSet: "salmon",
    path: "white",
    start: "gold",
    target: "red",
    wall: "black",
    pathLine: "red",
    tracker: "steelblue",
  },
  mazePathfinder: {
    cell: "#262729",
    obstacle: "#111111",
    visited: "gray",
    current: "purple",
    openSet: "seagreen",
    closedSet: "salmon",
    path: "white",
    start: "gold",
    target: "red",
    wall: "#1a1a1a",
    pathLine: "red",
    tracker: "steelblue",
  },
};

/** Palette slots of the cell painter, in `CELL_PALETTE` order. */
export const CELL_COLOR = {
  cell: 0,
  obstacle: 1,
  visited: 2,
  current: 3,
  openSet: 4,
  closedSet: 5,
  path: 6,
  start: 7,
  target: 8,
} as const;
export type CellColor = (typeof CELL_COLOR)[keyof typeof CELL_COLOR];

const CELL_PALETTE = [
  "cell",
  "obstacle",
  "visited",
  "current",
  "openSet",
  "closedSet",
  "path",
  "start",
  "target",
] as const satisfies readonly (keyof GridScheme)[];

/** Cell box height as a fraction of the cell size; obstacles and walls are multiples of it. */
const CELL_HEIGHT = 0.2;
const OBSTACLE_HEIGHT = 3;
const WALL_HEIGHT = 2;
/** Wall thickness as a fraction of the cell size. */
const WALL_THICKNESS = 0.2;
/** Gap between the board's top face and the y = 0 plane the path line is drawn on. */
const SURFACE_GAP = 0.1;
const TRACKER_RADIUS = 0.3;
/** Exponential decay rate of the tracker towards the cursor; higher is snappier. */
const TRACKER_LAMBDA = 10;

export type GridMeshes = {
  /** One instance per cell, `instanceId === cell.id`. */
  readonly cells: InstancedMesh;
  /** One instance per unique wall slot; absent for the open-ground A* variant. */
  readonly walls: InstancedMesh | null;
  /** The sphere that walks the found path. Hidden until `followTracker` shows it. */
  readonly tracker: Mesh;
  readonly painter: InstancedPainter;
  paint(cell: GridCell, color: CellColor): void;
  /** Obstacles are drawn as taller blocks. */
  setObstacle(cell: GridCell, obstacle: boolean): void;
  syncObstacles(): void;
  setWall(cell: GridCell, side: Side, visible: boolean): void;
  /** Re-applies every `cell.walls` flag to the wall instances. */
  syncWalls(): void;
  /** Damps the tracker towards the cursor, snapping when it first appears. */
  followTracker(cursor: PathCursor, visible: boolean, dt: number): void;
  dispose(): void;
};

/** Number of unique wall slots: one per horizontal edge plus one per vertical edge. */
export function wallSlotCount(rows: number, cols: number): number {
  return (rows + 1) * cols + rows * (cols + 1);
}

/**
 * Wall instance shared by a cell side and its neighbour's opposite side.
 * Horizontal edges come first (`row * cols + col` is the north edge of the
 * cell), then vertical ones (`row * (cols + 1) + col` is the west edge).
 */
export function wallSlot(grid: Grid, cell: GridCell, side: Side): number {
  const { rows, cols } = grid.options;
  const horizontal = (rows + 1) * cols;
  switch (side) {
    case 0:
      return cell.row * cols + cell.col;
    case 2:
      return (cell.row + 1) * cols + cell.col;
    case 3:
      return horizontal + cell.row * (cols + 1) + cell.col;
    case 1:
      return horizontal + cell.row * (cols + 1) + cell.col + 1;
  }
}

export function createGridMeshes(
  grid: Grid,
  scheme: GridScheme,
  { walls: withWalls }: { walls: boolean }
): GridMeshes {
  const { rows, cols, cellSize } = grid.options;
  const height = cellSize * CELL_HEIGHT;
  const bottom = -height - SURFACE_GAP;
  const matrix = new Matrix4();
  const zero = new Matrix4().makeScale(0, 0, 0);

  const cellGeometry = new BoxGeometry(cellSize * 0.9, height, cellSize * 0.9);
  const cellMaterial = new MeshStandardMaterial();
  const cells = new InstancedMesh(
    cellGeometry,
    cellMaterial,
    grid.cells.length
  );
  cells.frustumCulled = false;

  const cellMatrix = (cell: GridCell, obstacle: boolean): Matrix4 => {
    const scale = obstacle ? OBSTACLE_HEIGHT : 1;
    return matrix
      .makeScale(1, scale, 1)
      .setPosition(cell.center.x, bottom + (height * scale) / 2, cell.center.z);
  };
  const setObstacle = (cell: GridCell, obstacle: boolean): void => {
    cells.setMatrixAt(cell.id, cellMatrix(cell, obstacle));
    cells.instanceMatrix.needsUpdate = true;
  };
  for (const cell of grid.cells) setObstacle(cell, cell.obstacle);

  const painter = new InstancedPainter(
    cells,
    CELL_PALETTE.map((key) => new Color(scheme[key]))
  );
  painter.fill(CELL_COLOR.cell);

  let walls: InstancedMesh | null = null;
  const slotMatrices: Matrix4[] = [];
  let wallGeometry: BoxGeometry | null = null;
  let wallMaterial: MeshStandardMaterial | null = null;
  if (withWalls) {
    const thickness = cellSize * WALL_THICKNESS;
    const wallHeight = height * WALL_HEIGHT;
    const y = bottom + wallHeight / 2;
    wallGeometry = new BoxGeometry(1, 1, 1);
    wallMaterial = new MeshStandardMaterial({ color: scheme.wall });
    walls = new InstancedMesh(
      wallGeometry,
      wallMaterial,
      wallSlotCount(rows, cols)
    );
    walls.frustumCulled = false;
    // Walls are drawn only; picking goes through the cells.
    walls.raycast = () => undefined;
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = cellCenter(grid.options, row, col);
        slotMatrices.push(
          new Matrix4()
            .makeScale(cellSize + thickness, wallHeight, thickness)
            .setPosition(center.x, y, center.z - cellSize / 2)
        );
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const center = cellCenter(grid.options, row, col);
        slotMatrices.push(
          new Matrix4()
            .makeScale(thickness, wallHeight, cellSize + thickness)
            .setPosition(center.x - cellSize / 2, y, center.z)
        );
      }
    }
  }

  const setWall = (cell: GridCell, side: Side, visible: boolean): void => {
    if (!walls) return;
    const slot = wallSlot(grid, cell, side);
    walls.setMatrixAt(slot, visible ? at(slotMatrices, slot) : zero);
    walls.instanceMatrix.needsUpdate = true;
  };
  const syncWalls = (): void => {
    if (!walls) return;
    for (const cell of grid.cells) {
      for (const side of SIDES) {
        const other = cell.sideTo[side];
        // A shared slot is open only when both cells agree.
        const closed =
          cell.walls[side] || (other !== null && other.walls[OPPOSITE[side]]);
        setWall(cell, side, closed);
      }
    }
  };
  syncWalls();

  const radius = cellSize * TRACKER_RADIUS;
  const trackerGeometry = new SphereGeometry(radius, 24, 24);
  const trackerMaterial = new MeshStandardMaterial({ color: scheme.tracker });
  const tracker = new Mesh(trackerGeometry, trackerMaterial);
  tracker.visible = false;
  const goal = new Vector3();

  return {
    cells,
    walls,
    tracker,
    painter,
    paint(cell, color) {
      painter.set(cell.id, color);
    },
    setObstacle,
    syncObstacles() {
      for (const cell of grid.cells) setObstacle(cell, cell.obstacle);
    },
    setWall,
    syncWalls,
    followTracker(cursor, visible, dt) {
      if (!visible) {
        tracker.visible = false;
        return;
      }
      cursor.position(goal);
      goal.y += radius;
      if (!tracker.visible) {
        tracker.visible = true;
        tracker.position.copy(goal);
        return;
      }
      const { position } = tracker;
      position.set(
        MathUtils.damp(position.x, goal.x, TRACKER_LAMBDA, dt),
        MathUtils.damp(position.y, goal.y, TRACKER_LAMBDA, dt),
        MathUtils.damp(position.z, goal.z, TRACKER_LAMBDA, dt)
      );
    },
    dispose() {
      cellGeometry.dispose();
      cellMaterial.dispose();
      cells.dispose();
      wallGeometry?.dispose();
      wallMaterial?.dispose();
      walls?.dispose();
      trackerGeometry.dispose();
      trackerMaterial.dispose();
    },
  };
}
