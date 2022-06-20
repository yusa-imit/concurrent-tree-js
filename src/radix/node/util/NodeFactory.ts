import Node from '../Node';

export default interface NodeFactory {
  createNode: (
    edgeCharacters: string,
    value: any,
    childNodes: Node[],
    isRoot: boolean
  ) => Node;
}
