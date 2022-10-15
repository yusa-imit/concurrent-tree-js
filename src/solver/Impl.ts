import { ConcurrentRadixTree } from '../radix/ConcurrentRadixTree';
import Node from '../radix/node/Node';
import NodeFactory from '../radix/node/NodeFactory';
import { NodeKeyPair } from '../lib/NodeKeyPair';
import { CustomIterator } from '../lib/CustomIterator';

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
  lazyTraverseDescendants(startKey: string, startNode: Node) {
    return ConcurrentRadixTree.lazyTraverseDescendants(startKey, startNode);
  }
  getLongestCommonSubstring(originalDocuments: Set<string>): string {
    const root: Node = this.getNode();
    let longestCommonSubstringSoFar = [''];
    let longestCommonSubstringSoFarLength = [0];
    for (const nodeKeyPair of this.lazyTraverseDescendants(
      '',
      root
    ) as CustomIterator<NodeKeyPair>) {
      if (
        nodeKeyPair?.key.length > longestCommonSubstringSoFarLength[0] &&
        this.subTreeReferencesAllOriginalDocuments(
          nodeKeyPair?.key,
          nodeKeyPair?.node,
          originalDocuments
        )
      ) {
        longestCommonSubstringSoFarLength[0] = nodeKeyPair?.key.length;
        longestCommonSubstringSoFar[0] = nodeKeyPair?.key;
      }
    }
    return longestCommonSubstringSoFar[0];
  }
  subTreeReferencesAllOriginalDocuments(
    key: string,
    node: Node,
    originalDocuments: Set<string>
  ): boolean {
    const documentsEncounteredSoFar = new Set<string>();
    let result: boolean[] = [false];
    for (const nodeKeyPair of this.lazyTraverseDescendants(
      key,
      node
    ) as CustomIterator<NodeKeyPair>) {
      const documentsReferncedByThisNode: Set<string> = nodeKeyPair.node.getValue();
      if (documentsReferncedByThisNode !== null) {
        for (const value of documentsReferncedByThisNode) {
          documentsEncounteredSoFar.add(value);
        }
        if (documentsEncounteredSoFar == originalDocuments) {
          result[0] = true;
          break;
        }
      }
    }
    return result[0];
  }
}
