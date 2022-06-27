import Node from './Node';

export default interface NodeFactory<T> {
  createNode: (
    edgeCharacters: string,
    value: T,
    childNodes: Node[],
    isRoot: boolean
  ) => Node;
}
