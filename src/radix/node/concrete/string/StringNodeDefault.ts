import { CompareTo } from '../../../../lib/CompareTo';
import { Nullable } from '../../../../lib/Nullable';
import Node from '../../Node';
import { NodeUtil } from '../../util/NodeUtil';

export class StringNodeDefault implements Node {
  private incomingEdgeString: string;
  private outgoingEdges: Node[];
  private value: any;
  constructor(edgeString: string, value: any, outgoingEdges: Node[]) {
    outgoingEdges.sort((a, b) => {
      return CompareTo(
        a.getIncomingEdgeFirstCharacter(),
        b.getIncomingEdgeFirstCharacter()
      );
    });
    this.outgoingEdges = outgoingEdges;
    this.incomingEdgeString = edgeString;
    this.value = value;
  }
  getIncomingEdgeFirstCharacter: () => string = () => {
    return this.incomingEdgeString[0];
  };
  getIncomingEdge: () => string = () => {
    return this.incomingEdgeString;
  };
  getValue: () => any = () => {
    return this.value;
  };
  getOutgoingEdge: (
    edgeFirstString: string
  ) => Nullable<Node> = edgeFirstString => {
    let index = NodeUtil.binarySearchForEdge(
      this.outgoingEdges,
      edgeFirstString
    );
    if (index < 0) {
      return null;
    }
    return this.outgoingEdges[index];
  };
  updateOutgoingEdge: (childNode: Node) => void = childNode => {
    const index = NodeUtil.binarySearchForEdge(
      this.outgoingEdges,
      childNode.getIncomingEdgeFirstCharacter()
    );
    if (index < 0) {
      throw new Error(
        'Cannot update the reference to the following child node for the edge starting with ' +
          childNode.getIncomingEdgeFirstCharacter()
      );
    }
    this.outgoingEdges = [
      ...this.outgoingEdges.slice(0, index),
      childNode,
      ...this.outgoingEdges.slice(index, this.outgoingEdges.length),
    ];
  };
  getOutgoingEdges: () => Node[] = () => {
    return this.outgoingEdges;
  };
  toString: () => string = () => {
    return `Node{edge=${this.incomingEdgeString}, value=${
      this.value
    }, edges=${this.getOutgoingEdges()}}`;
  };
}
