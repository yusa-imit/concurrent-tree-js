import { Nullable } from '../../../../lib/Nullable';
import Node from '../../Node';
import { VoidValue } from '../VoidValue/VoidValue';

export class StringNodeLeafWithValue implements Node {
  private incomingEdgeString: string;
  private value: any;
  constructor(edgeString: string, value: any) {
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
