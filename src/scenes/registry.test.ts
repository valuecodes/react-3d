import { describe, expect, it } from "vitest";

import { SLUG_PATTERN } from "../lib/hashRoute";
import { at } from "../lib/invariant";
import { findScene, scenes } from "./registry";

describe("scene registry", () => {
  it("has unique, slug-shaped ids", () => {
    const ids = scenes.map((scene) => scene.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(SLUG_PATTERN);
  });

  it("falls back to the first scene for unknown routes", () => {
    expect(findScene(null)).toBe(at(scenes, 0));
    expect(findScene("nope")).toBe(at(scenes, 0));
    const last = at(scenes, scenes.length - 1);
    expect(findScene(last.id)).toBe(last);
  });
});
