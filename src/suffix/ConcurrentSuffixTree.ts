import { KeyValuePair } from '../common/KeyValuePair';
import { LazyIterator } from '../common/LazyIterator';
import { Strings } from '../common/Strings';
import { Nullable } from '../lib/Nullable';
import NodeFactory from '../radix/node/NodeFactory';
import { ConcurrentSuffixTreeImpl } from './Impl';
import { nullSafeIterator } from './NullSafeIterator';
import { SuffixTree } from './SuffixTree';
import { KeyValuePairImpl } from '../lib/KeyValuePairImpl';
import { CustomIterator } from '../lib/CustomIterator';
import { EmptySetCustomIterable } from '../common/Empties';

export class ConcurrentSuffixTree<T> implements SuffixTree<T> {
  radixTree;
  valueMap;
  constructor(nodeFactory: NodeFactory<Set<string>>) {
    this.radixTree = new ConcurrentSuffixTreeImpl<Set<string>>(nodeFactory);
    this.valueMap = new Map();
  }
  async put(key: string, value: T): Promise<Nullable<T>> {
    if (key === null) {
      throw new TypeError('The key argument was null');
    }
    if (key.length === 0) {
      throw new TypeError('The key argument was zero-length');
    }
    if (value === null) {
      throw new TypeError('The value argument was null');
    }
    const release = await this.radixTree.acquireLock();
    try {
      const keyString = String(key);
      const replacedValue = this.valueMap.set(keyString, value);
      if (replacedValue === null) {
        this.addSuffixesToRadixTree(keyString);
      }
      return replacedValue.get(keyString);
    } finally {
      release();
    }
  }
  async putIfAbsent(key: string, value: T): Promise<Nullable<T>> {
    const release = await this.radixTree.acquireLock();
    try {
      const keyString = String(key);
      let existingValue = null;
      if (!this.valueMap.has(keyString)) {
        existingValue = this.valueMap.set(keyString, value).get(keyString);
      }
      if (existingValue === null) {
        this.addSuffixesToRadixTree(keyString);
      }
      return existingValue;
    } finally {
      release();
    }
  }
  async remove(key: string): Promise<boolean> {
    const release = await this.radixTree.acquireLock();
    try {
      const keyString = String(key);
      const value = this.valueMap.get(keyString);
      if (value === null) {
        return false;
      }
      this.removeSuffixesFromRadixTree(keyString);
      this.valueMap.delete(keyString);
      return true;
    } finally {
      release();
    }
  }
  addSuffixesToRadixTree(keyAsString: string): void {
    const suffixes = Strings.generateSuffixes(keyAsString);
    for (const suffix of suffixes) {
      let originalKeyRefs = this.radixTree.getValueForExactKey(suffix);
      if (originalKeyRefs === null) {
        originalKeyRefs = this.createSetForOriginalKeys();
        this.radixTree.put(suffix, originalKeyRefs);
      }
      originalKeyRefs?.add(keyAsString);
    }
  }
  removeSuffixesFromRadixTree(keyAsString: string): void {
    const suffixes = Strings.generateSuffixes(keyAsString);
    for (const suffix of suffixes) {
      const originalKeyRefs = this.radixTree.getValueForExactKey(suffix);
      originalKeyRefs?.delete(keyAsString);
      if (originalKeyRefs?.size === 0) {
        this.radixTree.remove(suffix);
      }
    }
  }
  protected createSetForOriginalKeys(): Set<string> {
    return new Set();
  }
  getValueForExactKey(key: string): Nullable<T> {
    const keyString = String(key);
    return this.valueMap.get(keyString);
  }
  getKeysEndingWith(suffix: string): Iterable<Nullable<string>> {
    const originalKeys = this.radixTree.getValueForExactKey(suffix);
    if (originalKeys === null) {
      return new Set();
    }
    return originalKeys;
  }
  getValuesEndingWith(suffix: string): Iterable<Nullable<T>> {
    class itr extends LazyIterator<T> {
      originalKeys;
      valueMap;
      constructor(
        radixTree: ConcurrentSuffixTreeImpl<Set<string>>,
        valueMap: Map<any, any>
      ) {
        super();
        this.originalKeys = nullSafeIterator(
          radixTree.getValueForExactKey(suffix)
        );
        this.valueMap = valueMap;
      }
      protected computeNext(): Nullable<T> {
        let value = null;
        const iterator = this.originalKeys[Symbol.iterator]();
        while (value === null) {
          const next = iterator.next();
          if (next.done) {
            return this.endOfData();
          }
          const originalKey = next.value;
          value = this.valueMap.get(originalKey);
        }
        return value;
      }
    }
    return new itr(this.radixTree, this.valueMap);
  }
  getKeyValuePairsEndingWith(
    suffix: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<KeyValuePair<T>> {
      originalKeys;
      valueMap;
      constructor(
        radixTree: ConcurrentSuffixTreeImpl<Set<string>>,
        valueMap: Map<any, any>
      ) {
        super();
        this.originalKeys = nullSafeIterator(
          radixTree.getValueForExactKey(suffix)
        );
        this.valueMap = valueMap;
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        let value = null;
        let originalKey = null;
        const iterator = this.originalKeys[Symbol.iterator]();
        while (value === null) {
          const next = iterator.next();
          if (next.done) {
            return this.endOfData();
          }
          originalKey = next.value as string;
          value = this.valueMap.get(originalKey);
        }
        // @ts-expect-error
        return new KeyValuePairImpl<T>(originalKey, value);
      }
    }
    return new itr(this.radixTree, this.valueMap);
  }
  getKeysContaining(fragment: string): Iterable<Nullable<string>> {
    class itr extends LazyIterator<string> {
      originalKeysSets;
      keyIterator;
      keysAlreadyProcessed = new Set<string>();
      constructor(radixTree: ConcurrentSuffixTreeImpl<Set<string>>) {
        super();
        this.originalKeysSets = radixTree
          .getValuesForKeysStartingWith(fragment)
          [Symbol.iterator]();
        this.keyIterator = new Set<Nullable<string>>()[Symbol.iterator]();
      }
      protected computeNext(): Nullable<string> {
        let nextKey = null;
        while (nextKey === null) {
          const next = this.keyIterator.next();
          while (next.done) {
            const originNext = this.originalKeysSets.next();
            if (originNext.done || originNext.value === null) {
              return this.endOfData();
            }
            this.keyIterator = originNext.value[Symbol.iterator]();
          }
          nextKey = next.value;
          if (nextKey === null || this.keysAlreadyProcessed.has(nextKey)) {
            nextKey = null;
          } else {
            this.keysAlreadyProcessed.add(nextKey);
          }
        }
        return nextKey;
      }
    }
    return new itr(this.radixTree);
  }
  getValuesForKeysContaining(fragment: string): Iterable<Nullable<T>> {
    class itr extends LazyIterator<Nullable<T>> {
      valueMap;
      originalKeysSets;
      keyIterator;
      keysAlreadyProcessed = new Set<string>();
      constructor(
        radixTree: ConcurrentSuffixTreeImpl<Set<string>>,
        valueMap: Map<any, any>
      ) {
        super();
        this.originalKeysSets = radixTree
          .getValuesForKeysStartingWith(fragment)
          [Symbol.iterator]();
        this.keyIterator = new Set<Nullable<string>>()[Symbol.iterator]();
        this.valueMap = valueMap;
      }
      protected computeNext(): Nullable<T> {
        let value = null;
        while (value === null) {
          const next = this.keyIterator.next();
          while (next.done) {
            if (!this.originalKeysSets.hasNext()) {
              return this.endOfData();
            }
            this.keyIterator = this.originalKeysSets
              .next()
              .value[Symbol.iterator]();
          }
          let originalKey = next.value;
          if (
            originalKey !== null &&
            !this.keysAlreadyProcessed.has(originalKey)
          ) {
            this.keysAlreadyProcessed.add(originalKey);
            value = this.valueMap.get(originalKey);
          }
        }
        return value;
      }
    }
    return new itr(this.radixTree, this.valueMap);
  }
  getKeyValuePairsForKeysContaining(
    fragment: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<Nullable<KeyValuePair<T>>> {
      valueMap;
      originalKeysSets;
      keyIterator;
      keysAlreadyProcessed = new Set<string>();
      constructor(
        radixTree: ConcurrentSuffixTreeImpl<Set<string>>,
        valueMap: Map<any, any>
      ) {
        super();
        this.originalKeysSets = radixTree
          .getValuesForKeysStartingWith(fragment)
          [Symbol.iterator]();
        this.keyIterator = new Set<Nullable<string>>()[Symbol.iterator]();
        this.valueMap = valueMap;
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        let originalKey = null;
        let value = null;
        while (value === null) {
          const next = this.keyIterator.next();
          while (next.done) {
            if (!this.originalKeysSets.hasNext()) {
              return this.endOfData();
            }
            this.keyIterator = this.originalKeysSets
              .next()
              .value[Symbol.iterator]();
          }
          originalKey = next.value;
          if (
            originalKey !== null &&
            !this.keysAlreadyProcessed.has(originalKey)
          ) {
            this.keysAlreadyProcessed.add(originalKey);
            value = this.valueMap.get(originalKey);
          }
        }
        return new KeyValuePairImpl(originalKey as string, value);
      }
    }
    return new itr(this.radixTree, this.valueMap);
  }
  size() {
    return this.radixTree.size();
  }
  getNode() {
    return this.radixTree.getNode();
  }
}
