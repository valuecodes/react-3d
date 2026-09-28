/** Throws unless `condition` holds. Narrows the condition for TypeScript. */
export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * Indexed access that throws instead of returning `undefined`. Use it where an
 * index is known to be in range, so `noUncheckedIndexedAccess` guards stay
 * explicit instead of being sprinkled as `?? fallback`.
 */
export function at<T>(items: ArrayLike<T>, index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`Index ${index} is out of range (length ${items.length})`);
  }
  return item;
}
