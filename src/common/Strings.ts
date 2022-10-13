import { CustomIterator } from '../lib/CustomIterator';
export namespace Strings {
  export function generateSuffixes(input: string): CustomIterator<string> {
    class itr implements IterableIterator<string> {
      idx: number = 0;
      _arr: string;
      constructor(_a: string) {
        this._arr = _a;
      }
      next(): IteratorResult<string, any> {
        if (!this.hasNext()) return { value: undefined, done: true };
        return {
          value: this._arr.slice(this.idx++, this._arr.length),
          done: false,
        };
      }
      hasNext(): boolean {
        return this.idx < this._arr.length;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(input);
  }
  export function generatePrefixes(input: string): Iterable<string> {
    class itr implements IterableIterator<string> {
      idx: number = 0;
      _arr: string;
      constructor(_a: string) {
        this._arr = _a;
      }
      next(): IteratorResult<string, any> {
        if (!this.hasNext()) return { value: undefined, done: true };
        return { value: this._arr.slice(0, ++this.idx), done: false };
      }
      hasNext(): boolean {
        return this.idx < this._arr.length; // edit here
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(input);
  }
  export function getCommonPrefix(first: string, second: string) {
    const minLength = Math.min(first.length, second.length);
    for (var i = 0; i < minLength; i++) {
      if (first.charAt(i) !== second.charAt(i)) {
        return first.slice(0, i);
      }
    }
    return first.slice(0, minLength);
  }
  export function getSuffix(input: string, startIndex: number) {
    if (startIndex >= input.length) {
      return '';
    }
    return input.slice(startIndex, input.length);
  }
  export function getPrefix(input: string, endIndex: number) {
    if (endIndex < input.length) {
      return input;
    }
    return input.slice(0, endIndex);
  }
  export function subtractPrefix(main: string, prefix: string) {
    const startIndex = prefix.length;
    const mainLength = main.length;
    if (startIndex > mainLength) {
      return '';
    }
    return main.slice(startIndex, mainLength);
  }
  export function concatenate(first: string, second: string) {
    return first.concat(second);
  }
  export function reverse(input: string) {
    return input
      .split('')
      .reverse()
      .join('');
  }
  export function fromCharArray(input: string[]) {
    return input.join('');
  }
  export function toCharArray(input: string) {
    return input.split('');
  }
}

/**
 * Template for iterator
 */
/*
class itr implements IterableIterator<string> {
      idx: number = 0;
      _arr: string;
      constructor(_a: string) {
        this._arr = _a;
      }
      next(): IteratorResult<string, any> {
        if (!this.hasNext()) return { value: undefined, done: true };
        return { value: , done: false };
      }
      hasNext(): boolean {
        return ; // edit here
      }
      [Symbol.iterator]() {
        return this;
      }
    }
*/
