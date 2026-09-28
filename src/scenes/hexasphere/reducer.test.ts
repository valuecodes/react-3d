import { describe, expect, it } from "vitest";

import { initialOptions } from "./options";
import { hexasphereReducer } from "./reducer";

describe("hexasphereReducer", () => {
  it("starts pathfinders in Add Start mode and the maze creator in Rotate", () => {
    const painting = hexasphereReducer(initialOptions, {
      type: "SET",
      key: "Mode",
      value: "AddWalls",
    });
    expect(painting.Mode).toBe("AddWalls");

    const pathfinder = hexasphereReducer(painting, {
      type: "SET",
      key: "Algorithm",
      value: "Pathfinder",
    });
    expect(pathfinder.Algorithm).toBe("Pathfinder");
    expect(pathfinder.Mode).toBe("Add Start");

    const maze = hexasphereReducer(pathfinder, {
      type: "SET",
      key: "Algorithm",
      value: "Maze Creator",
    });
    expect(maze.Mode).toBe("Rotate");
  });

  it("numbers commands so the same button can fire twice", () => {
    const first = hexasphereReducer(initialOptions, {
      type: "COMMAND",
      key: "Simulation",
      value: "Start",
    });
    const second = hexasphereReducer(first, {
      type: "COMMAND",
      key: "Simulation",
      value: "Start",
    });
    expect(first.Simulation).toEqual({ value: "Start", seq: 1 });
    expect(second.Simulation).toEqual({ value: "Start", seq: 2 });
    expect(second.Obstacles).toBeNull();
  });

  it("clamps sphere settings and keeps state identity when nothing changes", () => {
    const tooFine = hexasphereReducer(initialOptions, {
      type: "SET_SPHERE",
      key: "detail",
      value: 9,
    });
    expect(tooFine.sphere.detail).toBe(5);

    const tooThin = hexasphereReducer(tooFine, {
      type: "SET_SPHERE",
      key: "wallWidth",
      value: 0,
    });
    expect(tooThin.sphere.wallWidth).toBe(1);
    expect(tooThin.sphere.detail).toBe(5);

    const same = hexasphereReducer(tooThin, {
      type: "SET_SPHERE",
      key: "wallWidth",
      value: 1,
    });
    expect(same).toBe(tooThin);
  });
});
