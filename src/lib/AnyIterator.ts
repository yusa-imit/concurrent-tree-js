import Iterables from '../common/Iterables';

export default class AnyIterator<T> implements Iterable<T>, Iterator<T> {
  private idx = 0;
  private _arr: Array<T>;
  constructor(iterable: Iterable<T>) {
    this._arr = Iterables.toArray(iterable);
  }
  next(): IteratorResult<T, any> {
    if (!this.hasNext()) return { done: true, value: undefined };
    return { value: this._arr[this.idx++], done: false };
  }
  hasNext(): boolean {
    return this.idx < this._arr.length;
  }
  [Symbol.iterator]() {
    return this;
  }
}
