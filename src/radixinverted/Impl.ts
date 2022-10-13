import { KeyValuePair } from '../common/KeyValuePair';
import { LazyIterator } from '../common/LazyIterator';
import { Strings } from '../common/Strings';
import { CustomIterator } from '../lib/CustomIterator';
import { KeyValuePairImpl } from '../lib/KeyValuePairImpl';
import { Nullable } from '../lib/Nullable';
import Node from '../radix/node/Node';
import NodeFactory from '../radix/node/NodeFactory';
import { ConcurrentRadixTree } from './../radix/ConcurrentRadixTree';
export class ConcurrentInvertedRadixTreeImpl<T> extends ConcurrentRadixTree<T> {
  constructor(nodeFactory: NodeFactory<T>) {
    super(nodeFactory);
  }
  scanForKeysAtStartOfInput(
    input: string
  ): LazyIterator<Nullable<KeyValuePair<T>>> {
    class itr extends LazyIterator<Nullable<KeyValuePair<T>>> {
      currentNode: Node;
      charsMatched: number = 0;
      documentLength = input.length;
      constructor(root: Node) {
        super();
        this.currentNode = root;
      }
      protected computeNext(): Nullable<KeyValuePair<T>> {
        while (this.charsMatched < this.documentLength) {
          const nextNode: Nullable<Node> = this.currentNode.getOutgoingEdge(
            input.charAt(this.charsMatched)
          );
          if (nextNode === null) {
            return this.endOfData();
          }
          this.currentNode = nextNode;
          const currentNodeEdgeCharacters: string = this.currentNode.getIncomingEdge();
          const numCharsInEdge = currentNodeEdgeCharacters.length;
          if (numCharsInEdge + this.charsMatched > this.documentLength) {
            return this.endOfData();
          }
          for (var i = 0; i < numCharsInEdge; i++) {
            if (
              currentNodeEdgeCharacters.charAt(i) !==
              input.charAt(this.charsMatched + i)
            ) {
              return this.endOfData();
            }
          }
          this.charsMatched += numCharsInEdge;
          if (this.currentNode.getValue() !== null) {
            return new KeyValuePairImpl<T>(
              input.slice(0, this.charsMatched),
              this.currentNode.getValue()
            );
          }
        }
        return this.endOfData();
      }
      [Symbol.iterator]() {
        return this;
      }
    }
    return new itr(this.root);
  }
  scanForLongestKeyAtStartOfInput(input: string) {
    let currentNode: Node = this.root;
    let charsMatched: number = 0;
    const documentLength = input.length;
    let candidateNode = null;
    let candidateCharsMatched = 0;
    outer_loop: while (charsMatched < documentLength) {
      let nextNode: Nullable<Node> = currentNode.getOutgoingEdge(
        input.charAt(charsMatched)
      );
      if (nextNode === null) break;
      currentNode = nextNode;
      const currentNodeEdgeCharacters = currentNode.getIncomingEdge();
      const numCharsInEdge = currentNodeEdgeCharacters.length;
      if (numCharsInEdge + charsMatched > documentLength) break;
      for (var i = 0; i < numCharsInEdge; i++) {
        if (
          currentNodeEdgeCharacters.charAt(i) !== input.charAt(charsMatched + i)
        ) {
          break outer_loop;
        }
      }
      charsMatched += numCharsInEdge;
      if (currentNode.getValue() !== null) {
        candidateNode = currentNode;
        candidateCharsMatched = charsMatched;
      }
    }
    return candidateNode === null
      ? null
      : new KeyValuePairImpl<T>(
          input.slice(0, candidateCharsMatched),
          candidateNode.getValue()
        );
  }
}
