import { KeyValuePair } from '../common/KeyValuePair';
import Node from './node/Node';
import { PrettyPrintable } from './node/util/PrettyPrintable';
import { RadixTree } from './RadixTree';
import NodeFactory from './node/NodeFactory';
import { ReentrantLock } from '../lib/ReentrantLock';
import { SearchResult } from './SearchResult';
import { Strings } from '../common/Strings';
import { Nullable } from '../lib/Nullable';
import { LazyIterator } from '../common/LazyIterator';
import { NodeKeyPair } from '../lib/NodeKeyPair';
import { CustomIterator } from '../lib/CustomIterator';
import { KeyValuePairImpl } from '../lib/KeyValuePairImpl';

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
  async put(key: string, value: T): Promise<Nullable<T>> {
    const existingValue: Nullable<T> = await this.putInternal(key, value, true);
    return existingValue;
  }
  async putIfAbsent(key: string, value: T): Promise<Nullable<T>> {
    const existingValue: Nullable<T> = await this.putInternal(
      key,
      value,
      false
    );
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
  getKeyStartingWith(prefix: string): Iterable<Nullable<string>> {
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
        prefix = Strings.concatenate(prefix, edgeSuffix);
        return this.getDescendantKeys(prefix, searchResult.nodeFound);
      }
      default:
        return [];
    }
  }
  getValuesForKeysStartingWith(prefix: string): Iterable<Nullable<T>> {
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
        prefix = Strings.concatenate(prefix, edgeSuffix);
        return this.getDescendantValues(prefix, searchResult.nodeFound);
      }
      default:
        return [];
    }
  }
  getKeyValuePairsForKeysStartingWith(
    prefix: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
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
        prefix = Strings.concatenate(prefix, edgeSuffix);
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
  getClosestKeys(candidate: string): Iterable<Nullable<string>> {
    const searchResult: SearchResult = this.searchTree(candidate);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantKeys(candidate, searchResult.nodeFound);
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        candidate = Strings.concatenate(candidate, edgeSuffix);
        return this.getDescendantKeys(candidate, searchResult.nodeFound);
      }
      case SearchResult.Classification.INCOMPLETE_MATCH_TO_END_OF_EDGE: {
        if (searchResult.charsMatched === 0) {
          break;
        }
        const keyOfNodeFound = Strings.getPrefix(
          candidate,
          searchResult.charsMatched
        );
        return this.getDescendantKeys(keyOfNodeFound, searchResult.nodeFound);
      }
      default:
        return [];
    }
    return [];
  }
  getValuesForClosestKeys(candidate: string): Iterable<Nullable<T>> {
    const searchResult: SearchResult = this.searchTree(candidate);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantValues(candidate, searchResult.nodeFound);
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        candidate = Strings.concatenate(candidate, edgeSuffix);
        return this.getDescendantValues(candidate, searchResult.nodeFound);
      }
      case SearchResult.Classification.INCOMPLETE_MATCH_TO_MIDDLE_OF_EDGE: {
        const keyOfParentNode = Strings.getPrefix(
          candidate,
          searchResult.charsMatched - searchResult.charsMatchedInNodeFound
        );
        const keyOfNodeFound = Strings.concatenate(
          keyOfParentNode,
          searchResult.nodeFound.getIncomingEdge()
        );
        return this.getDescendantValues(keyOfNodeFound, searchResult.nodeFound);
      }
      case SearchResult.Classification.INCOMPLETE_MATCH_TO_END_OF_EDGE: {
        if (searchResult.charsMatched === 0) {
          break;
        }
        const keyOfNodeFound = Strings.getPrefix(
          candidate,
          searchResult.charsMatched
        );
        return this.getDescendantValues(keyOfNodeFound, searchResult.nodeFound);
      }
      default:
        return [];
    }
    return [];
  }
  getKeyValuePairsForClosestKeys(
    candidate: string
  ): Iterable<Nullable<KeyValuePair<T>>> {
    const searchResult: SearchResult = this.searchTree(candidate);
    const classification = searchResult.classification;
    switch (classification) {
      case SearchResult.Classification.EXACT_MATCH:
        return this.getDescendantKeyValuePairs(
          candidate,
          searchResult.nodeFound
        );
      case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
        const edgeSuffix = Strings.getSuffix(
          searchResult.nodeFound.getIncomingEdge(),
          searchResult.charsMatchedInNodeFound
        );
        candidate = Strings.concatenate(candidate, edgeSuffix);
        return this.getDescendantKeyValuePairs(
          candidate,
          searchResult.nodeFound
        );
      }
      case SearchResult.Classification.INCOMPLETE_MATCH_TO_MIDDLE_OF_EDGE: {
        const keyOfParentNode = Strings.getPrefix(
          candidate,
          searchResult.charsMatched - searchResult.charsMatchedInNodeFound
        );
        const keyOfNodeFound = Strings.concatenate(
          keyOfParentNode,
          searchResult.nodeFound.getIncomingEdge()
        );
        return this.getDescendantKeyValuePairs(
          keyOfNodeFound,
          searchResult.nodeFound
        );
      }
      case SearchResult.Classification.INCOMPLETE_MATCH_TO_END_OF_EDGE: {
        if (searchResult.charsMatched === 0) {
          break;
        }
        const keyOfNodeFound = Strings.getPrefix(
          candidate,
          searchResult.charsMatched
        );
        return this.getDescendantKeyValuePairs(
          keyOfNodeFound,
          searchResult.nodeFound
        );
      }
      default:
        return [];
    }
    return [];
  }
  size(): number {
    const stack = [this.root];
    let count = 0;
    while (stack.length !== 0) {
      const current: Node = stack.pop() as Node;
      stack.push(...current.getOutgoingEdges());
      if (current.getValue() !== null) {
        count++;
      }
    }
    return count;
  }
  async putInternal(
    key: string,
    value: T,
    overwrite: boolean
  ): Promise<Nullable<T>> {
    if (key === null || !key)
      throw new Error('The key argument was null or undefined');
    if (key.length === 0) throw new Error('The key argument was zero-length');
    if (value === null || !value)
      throw new Error('The value argument was null or undefined');
    const release = await this.acquireLock();
    try {
      const searchResult: SearchResult = this.searchTree(key);
      const classification = searchResult.classification;
      switch (classification) {
        case SearchResult.Classification.EXACT_MATCH: {
          const existingValue: Nullable<T> = searchResult.nodeFound.getValue();
          if (!overwrite && existingValue !== null) {
            return existingValue;
          }
          const replacementNode: Node = this.nodeFactory.createNode(
            searchResult.nodeFound.getIncomingEdge(),
            value,
            searchResult.nodeFound.getOutgoingEdges(),
            false
          );
          searchResult.parentNode.updateOutgoingEdge(replacementNode);
          return existingValue;
        }
        case SearchResult.Classification.KEY_ENDS_MID_EDGE: {
          const keyCharsFromStartOfNodeFound = key.slice(
            searchResult.charsMatched - searchResult.charsMatchedInNodeFound,
            key.length
          );
          const commonPrefix = Strings.getCommonPrefix(
            keyCharsFromStartOfNodeFound,
            searchResult.nodeFound.getIncomingEdge()
          );
          const suffixFromExistingEdge = Strings.subtractPrefix(
            searchResult.nodeFound.getIncomingEdge(),
            commonPrefix
          );

          const newChild: Node = this.nodeFactory.createNode(
            suffixFromExistingEdge,
            searchResult.nodeFound.getValue(),
            searchResult.nodeFound.getOutgoingEdges(),
            false
          );
          const newParent: Node = this.nodeFactory.createNode(
            commonPrefix,
            value,
            [newChild],
            false
          );
          searchResult.parentNode.updateOutgoingEdge(newParent);
          return null;
        }
        case SearchResult.Classification.INCOMPLETE_MATCH_TO_END_OF_EDGE: {
          const keySuffix = key.slice(searchResult.charsMatched, key.length);
          const newChild = this.nodeFactory.createNode(
            keySuffix,
            value,
            [],
            false
          );

          const edges: Node[] = new Array(
            searchResult.nodeFound.getOutgoingEdges().length + 1
          );
          edges.push(...searchResult.nodeFound.getOutgoingEdges(), newChild);
          const cloneNode: Node = this.nodeFactory.createNode(
            searchResult.nodeFound.getIncomingEdge(),
            searchResult.nodeFound.getValue(),
            edges,
            searchResult.nodeFound === this.root
          );
          if (searchResult.nodeFound === this.root) {
            this.root = cloneNode;
          } else {
            searchResult.parentNode.updateOutgoingEdge(cloneNode);
          }
          return null;
        }
        case SearchResult.Classification.INCOMPLETE_MATCH_TO_MIDDLE_OF_EDGE: {
          const keyCharsFromStartOfNodeFound = key.slice(
            searchResult.charsMatched - searchResult.charsMatchedInNodeFound,
            key.length
          );
          const commonPrefix = Strings.getCommonPrefix(
            keyCharsFromStartOfNodeFound,
            searchResult.nodeFound.getIncomingEdge()
          );
          const suffixFromExistingEdge = Strings.subtractPrefix(
            searchResult.nodeFound.getIncomingEdge(),
            commonPrefix
          );
          const suffixFromKey = key.slice(
            searchResult.charsMatched,
            key.length
          );

          const n1: Node = this.nodeFactory.createNode(
            suffixFromKey,
            value,
            [],
            false
          );
          const n2: Node = this.nodeFactory.createNode(
            suffixFromExistingEdge,
            searchResult.nodeFound.getValue(),
            searchResult.nodeFound.getOutgoingEdges(),
            false
          );
          const n3: Node = this.nodeFactory.createNode(
            commonPrefix,
            null,
            [n1, n2],
            false
          );

          searchResult.parentNode.updateOutgoingEdge(n3);
          return null;
        }
        default:
          throw new Error(
            'Unexpected classification for search result: ' + searchResult
          );
      }
    } finally {
      release();
    }
  }
  getDescendantKeys(
    startKey: string,
    startNode: Node
  ): CustomIterator<Nullable<string>> {
    class itr extends LazyIterator<Nullable<string>> {
      descendantNodes: CustomIterator<Nullable<NodeKeyPair>>;
      constructor(startKey: string, startNode: Node) {
        super();
        this.descendantNodes = ConcurrentRadixTree.lazyTraverseDescendants(
          startKey,
          startNode
        );
      }
      protected computeNext(): Nullable<string> {
        while (this.descendantNodes.hasNext()) {
          const nodeKeyPair: NodeKeyPair = this.descendantNodes.next().value;
          const value = nodeKeyPair.node.getValue();
          if (value !== null) {
            const optionallyTransformedKey: string = ConcurrentRadixTree.transformKeyForResult(
              nodeKeyPair.key
            );
            return optionallyTransformedKey;
          }
        }
        return this.endOfData();
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(startKey, startNode);
  }
  getDescendantValues(
    startKey: string,
    startNode: Node
  ): CustomIterator<Nullable<T>> {
    class itr extends LazyIterator<Nullable<T>> {
      descendantNodes: CustomIterator<Nullable<NodeKeyPair>>;
      constructor(startKey: string, startNode: Node) {
        super();
        this.descendantNodes = ConcurrentRadixTree.lazyTraverseDescendants(
          startKey,
          startNode
        );
      }
      protected computeNext(): Nullable<T> {
        while (this.descendantNodes.hasNext()) {
          const nodeKeyPair: NodeKeyPair = this.descendantNodes.next().value;
          const value = nodeKeyPair.node.getValue();
          if (value !== null) {
            return value as T;
          }
        }
        return this.endOfData();
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(startKey, startNode);
  }
  getDescendantKeyValuePairs(
    startKey: string,
    startNode: Node
  ): CustomIterator<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<Nullable<KeyValuePair<T>>> {
      descendantNodes: CustomIterator<Nullable<NodeKeyPair>>;
      constructor(startKey: string, startNode: Node) {
        super();
        this.descendantNodes = ConcurrentRadixTree.lazyTraverseDescendants(
          startKey,
          startNode
        );
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        while (this.descendantNodes.hasNext()) {
          const nodeKeyPair: NodeKeyPair = this.descendantNodes.next().value;
          const value = nodeKeyPair.node.getValue();
          if (value !== null) {
            const optionallyTransformedKey: string = ConcurrentRadixTree.transformKeyForResult(
              nodeKeyPair.key
            );
            return new KeyValuePairImpl<T>(optionallyTransformedKey, value);
          }
        }
        return this.endOfData();
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(startKey, startNode);
  }
  protected static lazyTraverseDescendants(
    startKey: string,
    startNode: Node
  ): CustomIterator<Nullable<NodeKeyPair>> {
    class itr extends LazyIterator<Nullable<NodeKeyPair>> {
      stack: NodeKeyPair[];
      constructor(startKey: string, startNode: Node) {
        super();
        this.stack = [new NodeKeyPair(startNode, startKey)];
      }
      protected computeNext(): Nullable<NodeKeyPair> {
        if (this.stack.length === 0) return this.endOfData();
        const current: NodeKeyPair = this.stack.pop() as NodeKeyPair;
        const childNodes: Node[] = current.node.getOutgoingEdges();
        for (const child of childNodes.reverse()) {
          this.stack.push(
            new NodeKeyPair(
              child,
              Strings.concatenate(current.key, child.getIncomingEdge())
            )
          );
        }
        return current;
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(startKey, startNode);
  }
  protected static transformKeyForResult(key: string): string {
    return key;
  }
  searchTree(key: string): SearchResult {
    let parentNodesParent: Nullable<Node> = null;
    let parentNode: Nullable<Node> = null;
    let currentNode: Node = this.root;
    let charsMatched = 0;
    let charsMatchedInNodeFound = 0;

    const keyLength = key.length;
    outerLoop: while (charsMatched < keyLength) {
      const nextNode = currentNode.getOutgoingEdge(key.charAt(charsMatched));
      if (nextNode === null) {
        break outerLoop;
      }
      parentNodesParent = parentNode;
      parentNode = currentNode;
      currentNode = nextNode;
      charsMatchedInNodeFound = 0;
      const currentNodeEdgeCharacters = currentNode.getIncomingEdge();
      for (
        var i = 0, numEdgeChars = currentNodeEdgeCharacters.length;
        i < numEdgeChars && charsMatched < keyLength;
        i++
      ) {
        if (currentNodeEdgeCharacters.charAt(i) !== key.charAt(charsMatched)) {
          break outerLoop;
        }
        charsMatched++;
        charsMatchedInNodeFound++;
      }
    }
    return new SearchResult(
      key,
      currentNode,
      charsMatched,
      charsMatchedInNodeFound,
      parentNode as Node,
      parentNodesParent as Node
    );
  }
  getNode(): Node {
    return this.root;
  }
}
