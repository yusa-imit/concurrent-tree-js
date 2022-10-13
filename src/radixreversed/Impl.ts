import { Strings } from '../common/Strings';
import { ConcurrentRadixTree } from '../radix/ConcurrentRadixTree';
import NodeFactory from '../radix/node/NodeFactory';

export class ConcurrentReversedRadixTreeImpl<T> extends ConcurrentRadixTree<T> {
  constructor(nodeFactory: NodeFactory<T>) {
    super(nodeFactory);
  }
  transformKeyForResult(rawKey: string): string {
    return Strings.reverse(rawKey);
  }
}
