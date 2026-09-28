/** Joins class names, dropping falsy entries. Tailwind only sees complete class literals, so callers pass whole class strings. */
export function cx(
  ...classes: readonly (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
