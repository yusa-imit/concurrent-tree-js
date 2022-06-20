import Iterables from './Iterables';

export default class Iterator<T> implements Iterable<T> {
  private _arr: Array<T>;
  constructor(iterable: Iterable<T>) {
    this._arr = Iterables.toArray(iterable);
  }
  [Symbol.iterator]() {
    return this._arr[Symbol.iterator]();
  }
}
