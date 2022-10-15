import { KeyValuePair } from '../common/KeyValuePair';
import { Nullable } from '../lib/Nullable';

export interface SuffixTree<T> {
  put(key: string, value: T): Promise<Nullable<T>>;
  putIfAbsent(key: string, value: T): Promise<Nullable<T>>;
  remove(key: string): Promise<boolean>;
  getValueForExactKey(key: string): Nullable<T>;
  getKeysEndingWith(suffix: string): Iterable<Nullable<string>>;
  getValuesEndingWith(suffix: string): Iterable<Nullable<T>>;
  getKeyValuePairsEndingWith(
    suffix: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
  getKeysContaining(fragment: string): Iterable<Nullable<string>>;
  getValuesForKeysContaining(fragment: string): Iterable<Nullable<T>>;
  getKeyValuePairsForKeysContaining(
    fragment: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
}
