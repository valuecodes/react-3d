import { at } from "../lib/invariant";
import { hexasphereScene } from "./hexasphere";
import type { SceneDefinition } from "./types";

/** Every scene the picker offers, in display order. The first is the default route. */
export const scenes: readonly SceneDefinition[] = [hexasphereScene];

/** The scene for a route id; unknown or missing ids fall back to the first scene. */
export function findScene(id: string | null): SceneDefinition {
  return scenes.find((scene) => scene.id === id) ?? at(scenes, 0);
}
