import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  MeshStandardMaterial,
  OctahedronGeometry,
  SphereGeometry,
  Vector3,
} from "three";

import { InstancedPainter } from "../../three/instancedPainter";
import type { ElementKind, MeshTopology, Selection } from "./topology";

const PALETTE = [new Color("#64748b"), new Color("#f97316")] as const;
const BASE = 0;
const SELECTED = 1;

const _v = new Vector3();
const _m = new Matrix4();

/**
 * The pick targets of the mesh editor: one instanced mesh per element kind
 * (spheres on vertices, boxes on edge midpoints, octahedra on face centroids)
 * plus the edge lines. `refresh` re-reads the live positions after every edit.
 */
export class HandleSet {
  readonly vertices: InstancedMesh;
  readonly edges: InstancedMesh;
  readonly faces: InstancedMesh;
  readonly lines: LineSegments<BufferGeometry, LineBasicMaterial>;
  private readonly painters: Record<ElementKind, InstancedPainter>;
  private readonly linePositions: Float32BufferAttribute;
  private readonly material: MeshStandardMaterial;

  constructor(
    private readonly topology: MeshTopology,
    scale: number
  ) {
    const material = new MeshStandardMaterial({ color: "#ffffff" });
    this.material = material;
    this.vertices = instanced(
      new SphereGeometry(0.03 * scale, 16, 12),
      material,
      topology.vertexCount
    );
    this.edges = instanced(
      new BoxGeometry(0.045 * scale, 0.045 * scale, 0.045 * scale),
      material,
      topology.edges.length
    );
    this.faces = instanced(
      new OctahedronGeometry(0.04 * scale),
      material,
      topology.faces.length
    );
    this.painters = {
      vertex: new InstancedPainter(this.vertices, PALETTE),
      edge: new InstancedPainter(this.edges, PALETTE),
      face: new InstancedPainter(this.faces, PALETTE),
    };

    this.linePositions = new Float32BufferAttribute(
      topology.edges.length * 2 * 3,
      3
    );
    this.linePositions.setUsage(DynamicDrawUsage);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", this.linePositions);
    this.lines = new LineSegments(
      lineGeometry,
      new LineBasicMaterial({ color: "#1f2937" })
    );
    this.lines.frustumCulled = false;
  }

  /** Moves every handle and line onto the current vertex positions and colours the selection. */
  refresh(selection: Selection): void {
    const { topology } = this;
    for (let i = 0; i < topology.vertexCount; i++) {
      this.vertices.setMatrixAt(i, place(topology.vertexPosition(i, _v)));
    }
    for (let e = 0; e < topology.edges.length; e++) {
      this.edges.setMatrixAt(e, place(topology.edgeMidpoint(e, _v)));
    }
    for (let f = 0; f < topology.faces.length; f++) {
      this.faces.setMatrixAt(f, place(topology.faceCentroid(f, _v)));
    }
    for (const mesh of [this.vertices, this.edges, this.faces]) {
      mesh.instanceMatrix.needsUpdate = true;
      // Instanced raycasting tests this sphere first; a moved handle would
      // otherwise be unpickable outside the original bounds.
      mesh.computeBoundingSphere();
    }

    topology.edges.forEach((edge, e) => {
      topology.vertexPosition(edge.a, _v);
      this.linePositions.setXYZ(e * 2, _v.x, _v.y, _v.z);
      topology.vertexPosition(edge.b, _v);
      this.linePositions.setXYZ(e * 2 + 1, _v.x, _v.y, _v.z);
    });
    this.linePositions.needsUpdate = true;

    for (const kind of ["vertex", "edge", "face"] as const) {
      const painter = this.painters[kind];
      painter.fill(BASE);
      if (selection?.kind === kind) painter.set(selection.index, SELECTED);
    }
  }

  dispose(): void {
    for (const mesh of [this.vertices, this.edges, this.faces]) {
      mesh.geometry.dispose();
      mesh.dispose();
    }
    this.material.dispose();
    this.lines.geometry.dispose();
    this.lines.material.dispose();
  }
}

function instanced(
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  count: number
): InstancedMesh<BufferGeometry, MeshStandardMaterial> {
  const mesh = new InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  return mesh;
}

function place(position: Vector3): Matrix4 {
  return _m.identity().setPosition(position);
}
