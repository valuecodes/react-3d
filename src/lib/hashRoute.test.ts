import { describe, expect, it } from "vitest";

import { parseHash, toHash } from "./hashRoute";

describe("hashRoute", () => {
  it("reads a scene id from the hash", () => {
    expect(parseHash("#/grid-astar")).toBe("grid-astar");
    expect(parseHash("#hexasphere")).toBe("hexasphere");
  });

  it("rejects empty and malformed hashes", () => {
    expect(parseHash("")).toBeNull();
    expect(parseHash("#")).toBeNull();
    expect(parseHash("#/")).toBeNull();
    expect(parseHash("#/Bad Slug")).toBeNull();
    expect(parseHash("#/a/b")).toBeNull();
  });

  it("round-trips through toHash", () => {
    expect(parseHash(toHash("cube-maze"))).toBe("cube-maze");
  });
});
