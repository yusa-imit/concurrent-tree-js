import { KeyValuePair } from '../common/KeyValuePair';

export interface RadixTree<T> {
  put(key: string, value: T): T;
  putIfAbsent(key: string, value: T): T;
  remove(key: string): boolean;
  getValueForExactKey(key: string): T | null;
  getKeyStartingWith(prefix: string): Iterable<string>;
  getValuesForKeysStartingWith(prefix: string): Iterable<T>;
  getKeyValuePairsForKeysStartingWith(
    perfix: string
  ): Iterable<KeyValuePair<T>>;
  getClosestKeys(candidate: string): Iterable<string>;
  getValuesForClosestKeys(candidate: string): Iterable<T>;
  getKeyValuePairsForClosestKeys(candidate: string): Iterable<KeyValuePair<T>>;
  size(): number;
}
