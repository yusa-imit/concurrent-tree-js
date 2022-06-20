export default interface Node {
  getIncomingEdgeFirstCharacter: () => string;
  getIncomingEdge: () => string;
  getValue: () => any;
  getOutgoingEdge: (edgeFirstString: string) => Node;
  updateOutgoingEdge: (childNode: Node) => void;
  getOutgoingEdges: () => Node[];
}
