import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { at } from "../invariant";
import { startAStar, stepAStar } from "./aStar";
import type { AStarHooks, AStarState } from "./aStar";
import { euclidean } from "./graphNode";
import type { GraphNode } from "./graphNode";
import { startMaze, stepMaze } from "./mazeBacktracker";
import type { MazeHooks } from "./mazeBacktracker";
import { seededRandom } from "./random";

/** A tiny square lattice with 4-neighbour links and per-pair walls. */
class Node implements GraphNode<Node> {
  neighbors: Node[] = [];
  passages: Node[] = [];
  visited = false;
  obstacle = false;
  f = 0;
  g = 0;
  h = 0;
  previous: Node | null = null;
  center: Vector3;
  constructor(
    readonly id: number,
    readonly x: number,
    readonly y: number
  ) {
    this.center = new Vector3(x, 0, y);
  }
}

function lattice(size: number): Node[] {
  const nodes: Node[] = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) nodes.push(new Node(nodes.length, x, y));
  for (const node of nodes) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const other = nodes.find(
        (n) => n.x === node.x + dx && n.y === node.y + dy
      );
      if (other) node.neighbors.push(other);
    }
  }
  return nodes;
}

function runAStar(state: AStarState<Node>, hooks: AStarHooks<Node>) {
  let guard = 10_000;
  while (state.running && guard-- > 0) stepAStar(state, hooks);
  expect(state.running).toBe(false);
}

describe("generic A*", () => {
  it("finds a shortest path of unit steps", () => {
    const nodes = lattice(5);
    const hooks: AStarHooks<Node> = {
      neighborsOf: (n: Node) => n.neighbors.filter((m) => !m.obstacle),
      heuristic: euclidean,
    };
    const state = startAStar(nodes, at(nodes, 0), at(nodes, 24), hooks);
    runAStar(state, hooks);
    expect(state.noSolution).toBe(false);
    expect(state.path).toHaveLength(9);
    expect(at(state.path, 0)).toBe(at(nodes, 24));
    expect(at(nodes, 24).g).toBeCloseTo(8);
  });

  it("routes around obstacles and reports no solution when sealed", () => {
    const nodes = lattice(4);
    // Wall off column 2 except the bottom row.
    for (const n of nodes) if (n.x === 2 && n.y < 3) n.obstacle = true;
    const hooks: AStarHooks<Node> = {
      neighborsOf: (n: Node) => n.neighbors.filter((m) => !m.obstacle),
      heuristic: euclidean,
    };
    const state = startAStar(nodes, at(nodes, 0), at(nodes, 3), hooks);
    runAStar(state, hooks);
    expect(state.noSolution).toBe(false);
    expect(state.path.some((n) => n.obstacle)).toBe(false);
    expect(at(nodes, 3).g).toBeCloseTo(9);

    at(nodes, 14).obstacle = true; // seals the gap at (2,3)
    const sealed = startAStar(nodes, at(nodes, 0), at(nodes, 3), hooks);
    runAStar(sealed, hooks);
    expect(sealed.noSolution).toBe(true);
  });
});

describe("maze backtracker", () => {
  it("carves a spanning tree deterministically", () => {
    const nodes = lattice(6);
    const hooks: MazeHooks<Node> = {
      unvisitedNeighbors: (n: Node) => n.neighbors.filter((m) => !m.visited),
      removeWallsBetween: (a: Node, b: Node) => {
        a.passages.push(b);
        b.passages.push(a);
      },
      random: seededRandom(7),
    };
    const state = startMaze(at(nodes, 0));
    let guard = 10_000;
    while (state.running && guard-- > 0) stepMaze(state, hooks);
    expect(state.running).toBe(false);
    expect(state.carved).toBe(36);
    expect(nodes.every((n) => n.visited)).toBe(true);
    const passages = nodes.reduce((sum, n) => sum + n.passages.length, 0);
    expect(passages).toBe(2 * 35);
  });
});
