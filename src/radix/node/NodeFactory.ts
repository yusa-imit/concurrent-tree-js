import { Nullable } from '../../lib/Nullable';
import Node from './Node';

export default interface NodeFactory<T> {
  createNode: (
    edgeCharacters: string,
    value: Nullable<T>,
    childNodes: Node[],
    isRoot: boolean
  ) => Node;
}
