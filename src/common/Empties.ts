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
