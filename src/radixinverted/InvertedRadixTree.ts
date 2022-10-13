import { Nullable } from '../lib/Nullable';
import { RadixTree } from '../radix/RadixTree';
import { KeyValuePair } from '../common/KeyValuePair';

export interface InvertedRadixTree<T> extends RadixTree<T> {
  put(key: string, value: T): Promise<Nullable<T>>;
  pubIfAbsent(key: string, value: T): Promise<Nullable<T>>;
  remove(key: string): Promise<boolean>;
  getValueForExactKey(key: string): Nullable<T>;
  getKeysPrefixing(document: string): Iterable<Nullable<string>>;
  getValuesForKeysPrefixing(document: string): Iterable<Nullable<T>>;
  getKeyValuePairsForKeysPrefixing(
    document: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
  getLongestKeyPrefixing(document: string): Nullable<string>;
  getValueForLongestKeyPrefixing(document: string): Nullable<T>;
  getKeyValuePairForLongestKeyPrefixing(
    document: string
  ): Nullable<KeyValuePair<T>>;
  getKeysContainedIn(document: string): Iterable<Nullable<string>>;
  getValuesForKeysContainedIn(document: string): Iterable<Nullable<T>>;
  getKeyValuePairsForKeysContainedIn(
    document: string
  ): Iterable<Nullable<KeyValuePair<T>>>;
  size(): number;
}
