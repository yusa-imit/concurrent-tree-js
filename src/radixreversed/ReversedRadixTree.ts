import { Nullable } from '../lib/Nullable';
import { KeyValuePair } from '../common/KeyValuePair';

export interface ReversedRadixTree<T> {
  put(key: string, value: T): Promise<Nullable<T>>;
  putIfAbsent(key: string, value: T): Promise<Nullable<T>>;
  remove(key: string): Promise<boolean>;
  getValueForExactKey(key: string): Nullable<T>;
  getKeysEndingWith(suffix: string): Iterable<Nullable<string>>;
  getValuesEndingWith(suffix: string): Iterable<Nullable<T>>;
  getKeyValuePairsEndingWith(
    suffix: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
}
