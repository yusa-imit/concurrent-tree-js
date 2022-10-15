export function nullSafeIterator<T>(iterable: Iterable<T> | null) {
  return iterable === null ? new Set() : iterable;
}
