import { KeyValuePair } from '../common/KeyValuePair';
import Node from './node/Node';
import { PrettyPrintable } from './node/util/PrettyPrintable';
import { RadixTree } from './RadixTree';
import NodeFactory from './node/NodeFactory';
import { ReentrantLock } from '../lib/ReentrantLock';
import { SearchResult } from './SearchResult';

export class ConcurrentRadixTree<T> implements RadixTree<T>, PrettyPrintable {
  private nodeFactory: NodeFactory<T>;
  protected root: Node;
  private writeLock: ReentrantLock = new ReentrantLock();
  constructor(nodeFactory: NodeFactory<T>) {
    this.nodeFactory = nodeFactory;
    this.root = this.nodeFactory.createNode('', null, [], true);
  }
  protected async lockAndRelease(work: any) {
    const release = await this.writeLock.acquire();
    try {
      work();
    } finally {
      release();
    }
  }
  put(key: string, value: T): T {
    const existingValue: T = this.putInternal(key, value, true);
    return existingValue;
  }
  putIfAbsent(key: string, value: T): T {
    const existingValue: T = this.putInternal(key, value, false);
    return existingValue;
  }
  remove(key: string): boolean {
    throw new Error('Method not implemented.');
  }
  getValueForExactKey(key: string): T | null {
    const searchResult: SearchResult = this.searchTree(key);
    if (
      searchResult.classification.valueOf() === SearchResult.Classification.EXACT_MATCH.valueOf()
    ) {
      const value = searchResult.nodeFound.getValue();
      return value;
    }
    return null;
  }
  getKeyStartingWith(prefix: string): Iterable<string> {
    const searchResult: SearchResult = this.searchTree(prefix);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantKeys(prefix, searchResult.nodeFound);
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix: string = 
      }
      default:
        break;
    }
  }
  getValuesForKeysStartingWith(prefix: string): Iterable<T> {
    throw new Error('Method not implemented.');
  }
  getKeyValuePairsForKeysStartingWith(
    perfix: string
  ): Iterable<KeyValuePair<T>> {
    throw new Error('Method not implemented.');
  }
  getClosestKeys(candidate: string): Iterable<string> {
    throw new Error('Method not implemented.');
  }
  getValuesForClosestKeys(candidate: string): Iterable<T> {
    throw new Error('Method not implemented.');
  }
  getKeyValuePairsForClosestKeys(candidate: string): Iterable<KeyValuePair<T>> {
    throw new Error('Method not implemented.');
  }
  size(): number {
    throw new Error('Method not implemented.');
  }
  getNode(): Node {
    throw new Error('Method not implemented.');
  }
}
