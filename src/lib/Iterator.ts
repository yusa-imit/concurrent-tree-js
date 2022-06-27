import Iterables from '../common/Iterables';

export default class Iterator<T> implements Iterable<T> {
  private _arr: Array<T>;
  constructor(iterable: Iterable<T>) {
    this._arr = Iterables.toArray(iterable);
  }
  [Symbol.iterator]() {
    return this._arr[Symbol.iterator]();
  }
}

const iterable = new Iterator<String>([])
console.log(iterable[Symbol.iterator]);