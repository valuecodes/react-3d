import { describe, expect, it } from "vitest";

import { appReducer } from "./AppReducer";
import { initialOptions } from "./options";

describe("appReducer", () => {
  it("returns to rotate mode when the algorithm changes", () => {
    const painting = appReducer(initialOptions, {
      type: "SET",
      key: "Mode",
      value: "AddWalls",
    });
    expect(painting.Mode).toBe("AddWalls");
    const switched = appReducer(painting, {
      type: "SET",
      key: "Algorithm",
      value: "Pathfinder",
    });
    expect(switched.Algorithm).toBe("Pathfinder");
    expect(switched.Mode).toBe("Rotate");
  });

  it("numbers commands so the same button can fire twice", () => {
    const first = appReducer(initialOptions, {
      type: "COMMAND",
      key: "Simulation",
      value: "Start",
    });
    const second = appReducer(first, {
      type: "COMMAND",
      key: "Simulation",
      value: "Start",
    });
    expect(first.Simulation).toEqual({ value: "Start", seq: 1 });
    expect(second.Simulation).toEqual({ value: "Start", seq: 2 });
    expect(second.Obstacles).toBeNull();
  });
});
