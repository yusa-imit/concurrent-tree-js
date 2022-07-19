import { KeyValuePair } from '../common/KeyValuePair';
import Node from './node/Node';
import { PrettyPrintable } from './node/util/PrettyPrintable';
import { RadixTree } from './RadixTree';
import NodeFactory from './node/NodeFactory';
import { ReentrantLock } from '../lib/ReentrantLock';
import { SearchResult } from './SearchResult';
import { Strings } from '../common/Strings';

export class ConcurrentRadixTree<T> implements RadixTree<T>, PrettyPrintable {
  private nodeFactory: NodeFactory<T>;
  protected root: Node;
  private writeLock: ReentrantLock = new ReentrantLock();
  constructor(nodeFactory: NodeFactory<T>) {
    this.nodeFactory = nodeFactory;
    this.root = this.nodeFactory.createNode('', null, [], true);
  }
  protected async acquireLock() {
    return await this.writeLock.acquire();
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
  getValueForExactKey(key: string): T | null {
    const searchResult: SearchResult = this.searchTree(key);
    if (
      searchResult.classification.valueOf() ===
      SearchResult.Classification.EXACT_MATCH.valueOf()
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
        const edgeSuffix: string = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        const newPrefix = Strings.concatenate(prefix, searchResult.nodeFound);
        return this.getDescendantKeys(prefix, searchResult.nodeFound);
      }
      default:
        return [];
    }
  }
  getValuesForKeysStartingWith(prefix: string): Iterable<T> {
    const searchResult: SearchResult = this.searchTree(prefix);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantValues(prefix, searchResult.nodeFound);
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        const newPrefix = Strings.concatenate(prefix, edgeSuffix);
        return this.getDescendantValues(prefix, searchResult.nodeFound);
      }
      default:
        return [];
    }
  }
  getKeyValuePairsForKeysStartingWith(
    perfix: string
  ): Iterable<KeyValuePair<T>> {
    const searchResult: SearchResult = this.searchTree(prefix);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantKeyValuePairs(prefix, searchResult.nodeFound);
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        const newPrefix = Strings.concatenate(prefix, searchResult.nodeFound);
        return this.getDescendantKeyValuePairs(prefix, searchResult.nodeFound);
      }
      default:
        return [];
    }
  }
  async remove(key: string): Promise<boolean> {
    if (key === null) {
      throw new Error('The key argument was null');
    }
    const release = await this.acquireLock();
    try {
      const searchResult: SearchResult = this.searchTree(key);
      const classification = searchResult.classification;
      switch (classification) {
        case SearchResult.Classification.EXACT_MATCH: {
          if (searchResult.nodeFound.getValue() === null) {
            return false;
          }
          const childEdges: Array<Node> = searchResult.nodeFound.getOutgoingEdges();
          if (childEdges.length > 1) {
            const cloned: Node = this.nodeFactory.createNode(
              searchResult.nodeFound.getIncomingEdge(),
              null,
              searchResult.nodeFound.getOutgoingEdges(),
              false
            );
            searchResult.parentNode.updateOutgoingEdge(cloned);
          } else if (childEdges.length === 1) {
            const child: Node = childEdges[0];
            const concatenatedEdges = Strings.concatenate(
              searchResult.nodeFound.getIncomingEdge(),
              child.getIncomingEdge()
            );
            const mergeNode = this.nodeFactory.createNode(
              concatenatedEdges,
              child.getValue(),
              child.getOutgoingEdges(),
              false
            );
            searchResult.parentNode.updateOutgoingEdge(mergeNode);
          } else {
            const currentEdgesFromParent: Array<Node> = searchResult.parentNode.getOutgoingEdges();
            const newEdgesOfParent = new Array(
              searchResult.parentNode.getOutgoingEdges.length - 1
            ).fill(new Node());
            for (
              var i = 0,
                added = 0,
                numParentEdges = currentEdgesFromParent.length;
              i < numParentEdges;
              i++
            ) {
              const node = currentEdgesFromParent[i];
              if (node !== searchResult.nodeFound) {
                newEdgesOfParent[added++] = node;
              }
            }
            const parentIsRoot: boolean = searchResult.parentNode === this.root;
            let newParent: Node;
            if (
              newEdgesOfParent.length === 1 &&
              searchResult.parentNode.getValue() === null &&
              !parentIsRoot
            ) {
              const parentsRemainingChild: Node = newEdgesOfParent[0];
              const concatenatedEdges = Strings.concatenate(
                searchResult.parentNode.getIncomingEdge(),
                parentsRemainingChild.getIncomingEdge()
              );
              newParent = this.nodeFactory.createNode(
                concatenatedEdges,
                parentsRemainingChild.getValue(),
                parentsRemainingChild.getOutgoingEdges(),
                parentIsRoot
              );
            } else {
              newParent = this.nodeFactory.createNode(
                searchResult.parentNode.getIncomingEdge(),
                searchResult.parentNode.getValue(),
                newEdgesOfParent,
                parentIsRoot
              );
            }
            if (parentIsRoot) {
              this.root = newParent;
            } else {
              searchResult.ParentNodesParent.updateOutgoingEdge(newParent);
            }
          }
          return true;
        }
        default:
          return false;
      }
    } finally {
      release();
    }
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
