import { Nullable } from '../../lib/Nullable';

export default interface Node {
  getIncomingEdgeFirstCharacter: () => string;
  getIncomingEdge: () => string;
  getValue: () => any;
  getOutgoingEdge: (edgeFirstString: string) => Nullable<Node>;
  updateOutgoingEdge: (childNode: Node) => void;
  getOutgoingEdges: () => Node[];
}
