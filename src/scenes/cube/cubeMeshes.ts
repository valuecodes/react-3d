import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";

import { at } from "../../lib/invariant";
import { InstancedPainter } from "../../three/instancedPainter";
import { sideDirection } from "./cube";
import type { Cube, CubeCell, PathPoint } from "./cube";
import {
  cellLocalPosition,
  FACES,
  faceTransform,
  halfSide,
  pathLift,
} from "./formations";
import type { FaceDef, FaceName, Formation, Transform } from "./formations";

/** Palette indices for `InstancedPainter`. */
export const CELL_COLOR = {
  initial: 0,
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

const PALETTE = [
  "#4b5563",
  "#111827",
  "#9ca3af",
  "#a855f7",
  "seagreen",
  "salmon",
  "white",
  "#22c55e",
  "#ef4444",
] as const;

export const WALL_COLOR = "#1f2937";
export const FRAME_COLOR = "#9ca3af";
export const TRACKER_COLOR = "#dc2626";
export const PATH_LINE_COLOR = "#dc2626";

/** Proportions of the cell size. */
const CELL_INSET = 0.94;
const CELL_HEIGHT = 0.2;
const WALL_HEIGHT = 0.4;
const WALL_THICKNESS = 0.15;
const TRACKER_RADIUS = 0.3;
const OBSTACLE_SCALE = 2.5;

/** Where the active face is turned to when auto-rotating: toward the default camera. */
export const PRESENT_DIR = new Vector3(2, 2, 3).normalize();
/** Exponential decay rate for formation and rotation moves. */
const LAMBDA = 4;
/** Below this distance / angle a move snaps to its target. */
const SNAP = 1e-3;

/** Wall slots per face: `size * (size + 1)` row walls, then as many column walls. */
export function wallSlotCount(size: number): number {
  return 2 * size * (size + 1);
}

/** The slot index of a cell's wall on a side. Neighbouring cells share the slot. */
export function wallSlot(
  size: number,
  x: number,
  y: number,
  side: number
): number {
  const rows = size * (size + 1);
  switch (side) {
    case 0:
      return y * size + x;
    case 2:
      return (y + 1) * size + x;
    case 3:
      return rows + y * (size + 1) + x;
    default:
      return rows + y * (size + 1) + x + 1;
  }
}

const SLOT_ROTATION = new Quaternion().setFromAxisAngle(
  new Vector3(0, 1, 0),
  Math.PI / 2
);
const IDENTITY = new Quaternion();
const OPEN_SLOT = new Matrix4().makeScale(0, 0, 0);
const UP = new Vector3(0, 1, 0);

/** A face seen from its own group: `u` is local x and `v` is local z. */
const LOCAL_FACE: FaceDef = {
  name: "top",
  normal: UP,
  u: new Vector3(1, 0, 0),
  v: new Vector3(0, 0, 1),
  net: [0, 0],
};

function slotTransform(
  slot: number,
  size: number,
  cellSize: number,
  out: Matrix4
): Matrix4 {
  const h = halfSide(size, cellSize);
  const rows = size * (size + 1);
  const length = cellSize * (1 + WALL_THICKNESS);
  const scale = new Vector3(length, 1, 1);
  if (slot < rows) {
    const row = Math.floor(slot / size);
    const x = slot % size;
    const position = new Vector3(
      (x + 0.5) * cellSize - h,
      0,
      row * cellSize - h
    );
    return out.compose(position, IDENTITY, scale);
  }
  const rest = slot - rows;
  const y = Math.floor(rest / (size + 1));
  const column = rest % (size + 1);
  const position = new Vector3(
    column * cellSize - h,
    0,
    (y + 0.5) * cellSize - h
  );
  return out.compose(position, SLOT_ROTATION, scale);
}

function noRaycast(): void {
  // Never picked.
}

export type FaceMeshes = {
  readonly name: FaceName;
  readonly def: FaceDef;
  /** Positioned per formation; parent of the cell and wall meshes in the scene tree. */
  readonly group: Group;
  readonly cells: readonly CubeCell[];
  readonly cellMesh: InstancedMesh;
  /** Absent when the scene has no walls (A*). */
  readonly wallMesh: InstancedMesh | null;
  readonly painter: InstancedPainter;
  readonly targets: Record<Formation, Transform>;
};

/**
 * The three.js objects for one cube and every way they change over time.
 * The scene composes them (`root` > face groups, frame, path line, tracker)
 * and drives the animations from `useFrame`; the simulation paints and opens
 * walls. Nothing outside this class assigns to these objects.
 */
export class CubeMeshes {
  readonly root = new Group();
  readonly faces: readonly FaceMeshes[];
  readonly frame: LineSegments;
  readonly tracker: Mesh;
  readonly lift: number;

  private readonly cellGeometry: BoxGeometry;
  private readonly cellMaterial: MeshStandardMaterial;
  private readonly wallGeometry: BoxGeometry;
  private readonly wallMaterial: MeshStandardMaterial;
  private readonly frameMaterial: LineBasicMaterial;
  private readonly trackerGeometry: SphereGeometry;
  private readonly trackerMaterial: MeshBasicMaterial;

  private readonly matrix = new Matrix4();
  private readonly scratchA = new Vector3();
  private readonly scratchB = new Vector3();
  private readonly scratchC = new Vector3();
  /** Its own vector: `pathPointRootLocal` uses the scratch vectors internally. */
  private readonly trackerNext = new Vector3();
  private readonly scratchQ = new Quaternion();
  private readonly trackerGoal = new Vector3();

  constructor(
    readonly cube: Cube,
    readonly hasWalls: boolean
  ) {
    const { size, cellSize } = cube.options;
    this.lift = pathLift(cellSize);
    const palette = PALETTE.map((value) => new Color(value));

    this.cellGeometry = new BoxGeometry(
      cellSize * CELL_INSET,
      cellSize * CELL_HEIGHT,
      cellSize * CELL_INSET
    );
    this.cellGeometry.translate(0, (cellSize * CELL_HEIGHT) / 2, 0);
    this.cellMaterial = new MeshStandardMaterial({ color: "white" });
    this.wallGeometry = new BoxGeometry(
      1,
      cellSize * WALL_HEIGHT,
      cellSize * WALL_THICKNESS
    );
    this.wallGeometry.translate(0, (cellSize * WALL_HEIGHT) / 2, 0);
    this.wallMaterial = new MeshStandardMaterial({ color: WALL_COLOR });

    this.faces = cube.faces.map((face) => {
      const group = new Group();
      group.name = face.name;
      const cellMesh = new InstancedMesh(
        this.cellGeometry,
        this.cellMaterial,
        face.cells.length
      );
      cellMesh.instanceMatrix.setUsage(DynamicDrawUsage);
      cellMesh.frustumCulled = false;
      const painter = new InstancedPainter(cellMesh, palette);
      painter.fill(CELL_COLOR.initial);

      let wallMesh: InstancedMesh | null = null;
      if (hasWalls) {
        wallMesh = new InstancedMesh(
          this.wallGeometry,
          this.wallMaterial,
          wallSlotCount(size)
        );
        wallMesh.instanceMatrix.setUsage(DynamicDrawUsage);
        wallMesh.frustumCulled = false;
        wallMesh.raycast = noRaycast;
      }

      const targets = {
        cube: faceTransform(face.name, "cube", size, cellSize),
        net: faceTransform(face.name, "net", size, cellSize),
      };
      group.position.copy(targets.cube.position);
      group.quaternion.copy(targets.cube.quaternion);

      return {
        name: face.name,
        def: face.def,
        group,
        cells: face.cells,
        cellMesh,
        wallMesh,
        painter,
        targets,
      };
    });

    for (const cell of cube.cells) this.setObstacle(cell, false);
    this.closeAllWalls();

    const side = 2 * cube.halfSide;
    const box = new BoxGeometry(side, side, side);
    this.frameMaterial = new LineBasicMaterial({ color: FRAME_COLOR });
    this.frame = new LineSegments(new EdgesGeometry(box), this.frameMaterial);
    box.dispose();
    this.frame.raycast = noRaycast;

    this.trackerGeometry = new SphereGeometry(
      cellSize * TRACKER_RADIUS,
      16,
      12
    );
    this.trackerMaterial = new MeshBasicMaterial({ color: TRACKER_COLOR });
    this.tracker = new Mesh(this.trackerGeometry, this.trackerMaterial);
    this.tracker.raycast = noRaycast;
    this.tracker.visible = false;
  }

  faceOf(cell: CubeCell): FaceMeshes {
    return at(this.faces, cell.faceIndex);
  }

  paint(cell: CubeCell, color: CellColor): void {
    this.faceOf(cell).painter.set(cell.index, color);
  }

  /** Obstacles stand taller than plain cells. */
  setObstacle(cell: CubeCell, obstacle: boolean): void {
    const { size, cellSize } = this.cube.options;
    const { cellMesh } = this.faceOf(cell);
    cellLocalPosition(cell.x, cell.y, size, cellSize, this.scratchA);
    this.scratchB.set(1, obstacle ? OBSTACLE_SCALE : 1, 1);
    this.matrix.compose(this.scratchA, IDENTITY, this.scratchB);
    cellMesh.setMatrixAt(cell.index, this.matrix);
    cellMesh.instanceMatrix.needsUpdate = true;
  }

  /** Shows or hides each of the cell's four wall slots from `cell.walls`. */
  syncWalls(cell: CubeCell): void {
    const { wallMesh } = this.faceOf(cell);
    if (!wallMesh) return;
    const { size, cellSize } = this.cube.options;
    for (let side = 0; side < 4; side++) {
      const slot = wallSlot(size, cell.x, cell.y, side);
      if (cell.walls[side] ?? true) {
        wallMesh.setMatrixAt(
          slot,
          slotTransform(slot, size, cellSize, this.matrix)
        );
      } else {
        wallMesh.setMatrixAt(slot, OPEN_SLOT);
      }
    }
    wallMesh.instanceMatrix.needsUpdate = true;
  }

  closeAllWalls(): void {
    const { size, cellSize } = this.cube.options;
    for (const face of this.faces) {
      const { wallMesh } = face;
      if (!wallMesh) continue;
      for (let slot = 0; slot < wallMesh.count; slot++) {
        wallMesh.setMatrixAt(
          slot,
          slotTransform(slot, size, cellSize, this.matrix)
        );
      }
      wallMesh.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * Moves every face group one frame toward the formation. Returns true while
   * any face is still moving (including the frame on which it snaps).
   */
  animateFormation(formation: Formation, delta: number): boolean {
    const k = 1 - Math.exp(-LAMBDA * delta);
    let moving = false;
    for (const face of this.faces) {
      const target = face.targets[formation];
      const { position, quaternion } = face.group;
      if (
        position.equals(target.position) &&
        quaternion.equals(target.quaternion)
      ) {
        continue;
      }
      moving = true;
      if (
        position.distanceTo(target.position) < SNAP &&
        quaternion.angleTo(target.quaternion) < SNAP
      ) {
        position.copy(target.position);
        quaternion.copy(target.quaternion);
        continue;
      }
      position.set(
        MathUtils.damp(position.x, target.position.x, LAMBDA, delta),
        MathUtils.damp(position.y, target.position.y, LAMBDA, delta),
        MathUtils.damp(position.z, target.position.z, LAMBDA, delta)
      );
      quaternion.slerp(target.quaternion, k);
    }
    return moving;
  }

  /** Turns the root so `face` points at the viewer; null returns it to identity. */
  orientRoot(face: FaceName | null, delta: number): void {
    const target = face
      ? this.scratchQ.setFromUnitVectors(FACES[face].normal, PRESENT_DIR)
      : this.scratchQ.identity();
    const { quaternion } = this.root;
    if (quaternion.equals(target)) return;
    if (quaternion.angleTo(target) < SNAP) {
      quaternion.copy(target);
      return;
    }
    quaternion.slerp(target, 1 - Math.exp(-LAMBDA * delta));
  }

  /** A cell's centre in the root's space, lifted above its face, for the current face transforms. */
  cellRootLocal(cell: CubeCell, lift: number, out: Vector3): Vector3 {
    const { size, cellSize } = this.cube.options;
    const { group } = this.faceOf(cell);
    cellLocalPosition(cell.x, cell.y, size, cellSize, out);
    out.setY(lift);
    return out.applyQuaternion(group.quaternion).add(group.position);
  }

  /** Root-space position of a path point for the current face transforms. */
  pathPointRootLocal(point: PathPoint, out: Vector3): Vector3 {
    const { partner, cell } = point;
    if (!partner) return this.cellRootLocal(cell, this.lift, out);
    // The point above the shared edge: halfway between the two border
    // midpoints (which coincide once folded), lifted along both normals.
    this.borderRootLocal(partner, cell, out);
    this.borderRootLocal(cell, partner, this.scratchB);
    out.add(this.scratchB).multiplyScalar(0.5);
    out.addScaledVector(
      this.normalRootLocal(partner, this.scratchC),
      this.lift
    );
    out.addScaledVector(this.normalRootLocal(cell, this.scratchC), this.lift);
    return out;
  }

  /** Root-space points for a path, ready for `PathLine.setPath`. */
  rootLocalPoints(points: readonly PathPoint[]): { center: Vector3 }[] {
    return points.map((point) => ({
      center: this.pathPointRootLocal(point, new Vector3()),
    }));
  }

  /**
   * Moves the tracker sphere toward its place on the path (`progress` in
   * 0..1 along `points`), or hides it when there is no path to follow.
   */
  updateTracker(
    points: readonly PathPoint[],
    progress: number,
    delta: number
  ): void {
    const { tracker } = this;
    if (points.length === 0) {
      tracker.visible = false;
      return;
    }
    const goal = this.trackerGoal;
    const last = points.length - 1;
    const s = progress * last;
    const index = Math.min(Math.floor(s), last);
    this.pathPointRootLocal(at(points, index), goal);
    const next = points[index + 1];
    if (next) {
      this.pathPointRootLocal(next, this.trackerNext);
      goal.lerp(this.trackerNext, s - index);
    }
    if (!tracker.visible) {
      tracker.visible = true;
      tracker.position.copy(goal);
      return;
    }
    const { position } = tracker;
    position.set(
      MathUtils.damp(position.x, goal.x, LAMBDA * 3, delta),
      MathUtils.damp(position.y, goal.y, LAMBDA * 3, delta),
      MathUtils.damp(position.z, goal.z, LAMBDA * 3, delta)
    );
  }

  dispose(): void {
    for (const face of this.faces) {
      face.cellMesh.dispose();
      face.wallMesh?.dispose();
    }
    this.cellGeometry.dispose();
    this.cellMaterial.dispose();
    this.wallGeometry.dispose();
    this.wallMaterial.dispose();
    this.frame.geometry.dispose();
    this.frameMaterial.dispose();
    this.trackerGeometry.dispose();
    this.trackerMaterial.dispose();
  }

  /** The midpoint of `from`'s border edge toward `to`, on the face plane, in root space. */
  private borderRootLocal(from: CubeCell, to: CubeCell, out: Vector3): Vector3 {
    const { size, cellSize } = this.cube.options;
    const { group } = this.faceOf(from);
    cellLocalPosition(from.x, from.y, size, cellSize, out);
    const side = from.sideFacing(to);
    if (side !== null) {
      const local = sideDirection(LOCAL_FACE, side, this.scratchA);
      out.addScaledVector(local, cellSize / 2);
    }
    return out.applyQuaternion(group.quaternion).add(group.position);
  }

  private normalRootLocal(cell: CubeCell, out: Vector3): Vector3 {
    return out.copy(UP).applyQuaternion(this.faceOf(cell).group.quaternion);
  }
}
