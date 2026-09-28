/** Scene ids are URL-hash slugs: `#/grid-astar`. */
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

const HASH_PATTERN = /^#\/?([a-z0-9-]+)$/;

/** The scene id in a location hash, or null when there is none or it is malformed. */
export function parseHash(hash: string): string | null {
  return HASH_PATTERN.exec(hash)?.[1] ?? null;
}

export function toHash(id: string): string {
  return `#/${id}`;
}
