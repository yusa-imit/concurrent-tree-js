import { Nullable } from '../../../../lib/Nullable';
import Node from '../../Node';
import { VoidValue } from '../VoidValue/VoidValue';

export class StringNodeLeafVoidValue implements Node {
  private incomingEdgeString: string;
  constructor(edgeString: string) {
    this.incomingEdgeString = edgeString;
  }
  getIncomingEdgeFirstCharacter: () => string = () => {
    return this.incomingEdgeString[0];
  };
  getIncomingEdge: () => string = () => {
    return this.incomingEdgeString;
  };
  getValue: () => any = () => {
    return VoidValue.SINGLETON;
  };
  getOutgoingEdge: (
    edgeFirstString: string
  ) => Nullable<Node> = edgeFirstString => {
    return null;
  };
  updateOutgoingEdge: (childNode: Node) => void = childNode => {
    throw new Error(
      'Cannot update the reference to the following child node for the edge starting with ' +
        childNode.getIncomingEdgeFirstCharacter() +
        ', No such edge already exists: ' +
        childNode
    );
  };
  getOutgoingEdges: () => Node[] = () => {
    return [];
  };
  toString: () => string = () => {
    return `Node{edge=${
      this.incomingEdgeString
    }, value=${this.getValue()}, edges=${this.getOutgoingEdges()}}`;
  };
}
