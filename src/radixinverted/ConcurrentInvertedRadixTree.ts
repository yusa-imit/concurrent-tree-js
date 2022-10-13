import { KeyValuePair } from '../common/KeyValuePair';
import { Nullable } from '../lib/Nullable';
import { InvertedRadixTree } from './InvertedRadixTree';
import NodeFactory from '../radix/node/NodeFactory';
import { ConcurrentInvertedRadixTreeImpl } from './Impl';
import { LazyIterator } from '../common/LazyIterator';
import { Strings } from '../common/Strings';
import { EmptyKeyValuePairIterable } from '../common/Empties';

export class ConcurrentInvertedRadixTree<T> implements InvertedRadixTree<T> {
  private radixTree: ConcurrentInvertedRadixTreeImpl<T>;
  constructor(nodeFactory: NodeFactory<T>) {
    this.radixTree = new ConcurrentInvertedRadixTreeImpl<T>(nodeFactory);
  }
  put(key: string, value: T): Promise<Nullable<T>> {
    return this.radixTree.put(key, value);
  }
  pubIfAbsent(key: string, value: T): Promise<Nullable<T>> {
    return this.radixTree.putIfAbsent(key, value);
  }
  remove(key: string): Promise<boolean> {
    return this.radixTree.remove(key);
  }
  getValueForExactKey(key: string): Nullable<T> {
    return this.radixTree.getValueForExactKey(key);
  }
  getKeysPrefixing(document: string): Iterable<Nullable<string>> {
    class itr extends LazyIterator<string> {
      matchedForCurrentSuffix;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.matchedForCurrentSuffix = radixTree.scanForKeysAtStartOfInput(
          document
        );
      }
      protected computeNext(): Nullable<string> {
        if (this.matchedForCurrentSuffix.hasNext()) {
          return (this.matchedForCurrentSuffix.next().value as KeyValuePair<
            T
          >).getKey();
        } else {
          return this.endOfData();
        }
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  getValuesForKeysPrefixing(document: string): Iterable<Nullable<T>> {
    class itr extends LazyIterator<T> {
      matchedForCurrentSuffix;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.matchedForCurrentSuffix = radixTree.scanForKeysAtStartOfInput(
          document
        );
      }
      protected computeNext(): Nullable<T> {
        if (this.matchedForCurrentSuffix.hasNext()) {
          return (this.matchedForCurrentSuffix.next().value as KeyValuePair<
            T
          >).getValue();
        } else {
          return this.endOfData();
        }
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  getKeyValuePairsForKeysPrefixing(
    document: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<Nullable<KeyValuePair<T>>> {
      matchedForCurrentSuffix;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.matchedForCurrentSuffix = radixTree.scanForKeysAtStartOfInput(
          document
        );
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        if (this.matchedForCurrentSuffix.hasNext()) {
          return this.matchedForCurrentSuffix.next().value as KeyValuePair<T>;
        } else {
          return this.endOfData();
        }
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  getLongestKeyPrefixing(document: string): Nullable<string> {
    const match: Nullable<KeyValuePair<
      T
    >> = this.radixTree.scanForLongestKeyAtStartOfInput(document);
    return match === null ? null : match.getKey();
  }
  getValueForLongestKeyPrefixing(document: string): Nullable<T> {
    const match: Nullable<KeyValuePair<
      T
    >> = this.radixTree.scanForLongestKeyAtStartOfInput(document);
    return match === null ? null : match.getValue();
  }
  getKeyValuePairForLongestKeyPrefixing(
    document: string
  ): Nullable<KeyValuePair<T>> {
    return this.radixTree.scanForLongestKeyAtStartOfInput(document);
  }
  getKeysContainedIn(document: string): Iterable<Nullable<string>> {
    class itr extends LazyIterator<Nullable<string>> {
      radixTree;
      documentSuffixes = Strings.generateSuffixes(document);
      matchesForCurrentSuffixes: Iterator<
        Nullable<KeyValuePair<T>>
      > = EmptyKeyValuePairIterable;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.radixTree = radixTree;
      }
      protected computeNext(): Nullable<string> {
        while (this.matchesForCurrentSuffixes.next().done) {
          if (this.documentSuffixes.hasNext()) {
            const nextSuffix: string = this.documentSuffixes.next().value;
            this.matchesForCurrentSuffixes = this.radixTree.scanForKeysAtStartOfInput(
              nextSuffix
            );
          } else {
            return this.endOfData();
          }
        }
        return !this.matchesForCurrentSuffixes.next().done
          ? (this.matchesForCurrentSuffixes.next().value as KeyValuePair<
              T
            >).getKey()
          : null;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  getValuesForKeysContainedIn(document: string): Iterable<Nullable<T>> {
    class itr extends LazyIterator<Nullable<T>> {
      radixTree;
      documentSuffixes = Strings.generateSuffixes(document);
      matchesForCurrentSuffixes: Iterator<
        Nullable<KeyValuePair<T>>
      > = EmptyKeyValuePairIterable;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.radixTree = radixTree;
      }
      protected computeNext(): Nullable<T> {
        while (this.matchesForCurrentSuffixes.next().done) {
          if (this.documentSuffixes.hasNext()) {
            const nextSuffix: string = this.documentSuffixes.next().value;
            this.matchesForCurrentSuffixes = this.radixTree.scanForKeysAtStartOfInput(
              nextSuffix
            );
          } else {
            return this.endOfData();
          }
        }
        return !this.matchesForCurrentSuffixes.next().done
          ? (this.matchesForCurrentSuffixes.next().value as KeyValuePair<
              T
            >).getValue()
          : null;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  getKeyValuePairsForKeysContainedIn(
    document: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<Nullable<KeyValuePair<T>>> {
      radixTree;
      documentSuffixes = Strings.generateSuffixes(document);
      matchesForCurrentSuffixes: Iterator<
        Nullable<KeyValuePair<T>>,
        Nullable<KeyValuePair<T>>
      > = EmptyKeyValuePairIterable;
      constructor(radixTree: ConcurrentInvertedRadixTreeImpl<T>) {
        super();
        this.radixTree = radixTree;
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        while (this.matchesForCurrentSuffixes.next().done) {
          if (this.documentSuffixes.hasNext()) {
            const nextSuffix: string = this.documentSuffixes.next().value;
            this.matchesForCurrentSuffixes = this.radixTree.scanForKeysAtStartOfInput(
              nextSuffix
            );
          } else {
            return this.endOfData();
          }
        }
        return this.matchesForCurrentSuffixes.next().value;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.radixTree);
  }
  size(): number {
    return this.radixTree.size();
  }
  putIfAbsent(key: string, value: T): Promise<Nullable<T>> {
    return this.radixTree.putIfAbsent(key, value);
  }
  getKeyStartingWith(prefix: string): Iterable<Nullable<string>> {
    return this.radixTree.getKeyStartingWith(prefix);
  }
  getValuesForKeysStartingWith(prefix: string): Iterable<Nullable<T>> {
    return this.radixTree.getValuesForKeysStartingWith(prefix);
  }
  getKeyValuePairsForKeysStartingWith(
    prefix: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    return this.radixTree.getKeyValuePairsForKeysStartingWith(prefix);
  }
  getClosestKeys(candidate: string): Iterable<Nullable<string>> {
    return this.radixTree.getClosestKeys(candidate);
  }
  getValuesForClosestKeys(candidate: string): Iterable<Nullable<T>> {
    return this.radixTree.getValuesForClosestKeys(candidate);
  }
  getKeyValuePairsForClosestKeys(
    candidate: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    return this.radixTree.getKeyValuePairsForClosestKeys(candidate);
  }
}
