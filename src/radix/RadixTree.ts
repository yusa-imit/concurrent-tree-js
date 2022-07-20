import { KeyValuePair } from '../common/KeyValuePair';
import { Nullable } from '../lib/Nullable';

export interface RadixTree<T> {
  put(key: string, value: T): Promise<Nullable<T>>;
  putIfAbsent(key: string, value: T): Promise<Nullable<T>>;
  remove(key: string): Promise<boolean>;
  getValueForExactKey(key: string): Nullable<T>;
  getKeyStartingWith(prefix: string): Iterable<Nullable<string>>;
  getValuesForKeysStartingWith(prefix: string): Iterable<Nullable<T>>;
  getKeyValuePairsForKeysStartingWith(
    perfix: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
  getClosestKeys(candidate: string): Iterable<Nullable<string>>;
  getValuesForClosestKeys(candidate: string): Iterable<Nullable<T>>;
  getKeyValuePairsForClosestKeys(
    candidate: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
  size(): number;
}
