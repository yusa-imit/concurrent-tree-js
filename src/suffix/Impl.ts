import { ConcurrentRadixTree } from '../radix/ConcurrentRadixTree';
import NodeFactory from '../radix/node/NodeFactory';

export class ConcurrentSuffixTreeImpl<T> extends ConcurrentRadixTree<T> {
  constructor(nodeFactory: NodeFactory<T>) {
    super(nodeFactory);
  }
  acquireLock(): Promise<() => void> {
    return super.acquireLock();
  }
  lockAndRelease(work: any): Promise<void> {
    return super.lockAndRelease(work);
  }
}
