import { EmptySetCustomIterable } from './Empties';
import { CustomIterator } from '../lib/CustomIterator';
import { Nullable } from '../lib/Nullable';
import { KeyValuePair } from './KeyValuePair';

export const EmptyKeyValuePairIterable: CustomIterator<Nullable<
  KeyValuePair<any>
>> = new (class {
  value = [];
  length = 0;
  next() {
    return {
      value: null,
      done: true,
    };
  }
  hasNext() {
    return false;
  }
  [Symbol.iterator]() {
    return this;
  }
})();

const set = new Set();
const itr = function(): CustomIterator<any> {
  // @ts-ignore
  const value = new Array(...this);
  let count = 0;
  return {
    next: () => {
      return {
        done: count > value.length,
        value: value[count],
      };
    },
    hasNext: () => {
      return count > value.length;
    },
    [Symbol.iterator]() {
      return this;
    },
  };
};
const iterator: CustomIterator<any> = itr.apply(set);

export { set as EmptySetCustomIterable };
export { iterator as EmptySetCustomIterableIterator };
