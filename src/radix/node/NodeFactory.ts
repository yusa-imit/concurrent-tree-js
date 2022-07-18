import Node from './Node';

type Nullable<T> = T | null;
export default interface NodeFactory<T> {
  createNode: (
    edgeCharacters: string,
    value: Nullable<T>,
    childNodes: Node[],
    isRoot: boolean
  ) => Node;
}
