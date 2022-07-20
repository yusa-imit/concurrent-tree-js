export interface CustomIterator<T> extends Iterator<T>, Iterable<T> {
  hasNext: () => boolean;
}
