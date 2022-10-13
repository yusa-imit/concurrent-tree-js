import { ConcurrentRadixTree } from '../radix/ConcurrentRadixTree';
import { ReversedRadixTree } from './ReversedRadixTree';
import NodeFactory from '../radix/node/NodeFactory';
import { ConcurrentReversedRadixTreeImpl } from './Impl';
import { KeyValuePair } from '../common/KeyValuePair';
import { Nullable } from '../lib/Nullable';
import { Strings } from '../common/Strings';
import Node from '../radix/node/Node';

export class ConcurrentReversedRadixTree<T> implements ReversedRadixTree<T> {
  private radixTree: ConcurrentRadixTree<T>;
  constructor(nodeFactory: NodeFactory<T>) {
    this.radixTree = new ConcurrentReversedRadixTreeImpl<T>(nodeFactory);
  }
  put(key: string, value: T): Promise<Nullable<T>> {
    return this.radixTree.put(Strings.reverse(key), value);
  }
  putIfAbsent(key: string, value: T): Promise<Nullable<T>> {
    return this.radixTree.putIfAbsent(Strings.reverse(key), value);
  }
  remove(key: string): Promise<boolean> {
    return this.radixTree.remove(Strings.reverse(key));
  }
  getValueForExactKey(key: string): Nullable<T> {
    return this.radixTree.getValueForExactKey(Strings.reverse(key));
  }
  getKeysEndingWith(suffix: string): Iterable<Nullable<string>> {
    return this.radixTree.getKeyStartingWith(Strings.reverse(suffix));
  }
  getValuesEndingWith(suffix: string): Iterable<Nullable<T>> {
    return this.radixTree.getValuesForKeysStartingWith(Strings.reverse(suffix));
  }
  getKeyValuePairsEndingWith(
    suffix: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    return this.radixTree.getKeyValuePairsForKeysStartingWith(
      Strings.reverse(suffix)
    );
  }
  size(): number {
    return this.radixTree.size();
  }
  getNode(): Node {
    return this.radixTree.getNode();
  }
}
