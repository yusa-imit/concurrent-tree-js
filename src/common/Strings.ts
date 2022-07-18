import AnyIterator from '../lib/AnyIterator';

export namespace Strings {
  export function generateSuffixes(input: string): Iterable<string> {
    class itr implements IterableIterator<string> {
      idx: number = 1;
      _arr: string;
      constructor(_a: string) {
        this._arr = _a;
      }
      next(): IteratorResult<string, any> {
        if (!this.hasNext()) return { value: undefined, done: true };
        return { value: this._arr.slice(0, this.idx++), done: false };
      }
      hasNext(): boolean {
        return this.idx <= this._arr.length + 1;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(input);
  }
  export function generatePrefixes(input: string): Iterable<string> {
    return;
  }
}
