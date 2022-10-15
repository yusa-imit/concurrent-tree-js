export interface CustomIterator<T> extends IterableIterator<T> {
  hasNext: () => boolean;
  [Symbol.iterator]: () => CustomIterator<T>;
}
