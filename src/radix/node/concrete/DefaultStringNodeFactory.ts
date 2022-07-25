import { Nullable } from '../../../lib/Nullable';
import Node from '../Node';
import NodeFactory from '../NodeFactory';
import { NodeUtil } from '../util/NodeUtil';
import { StringNodeDefault } from './string/StringNodeDefault';

export class DefaultStringNodeFactory implements NodeFactory<string> {
  public createNode(
    edgeCharacters: string,
    value: Nullable<string>,
    childNodes: Node[],
    isRoot: boolean
  ): Node {
    if (edgeCharacters === null) throw new Error('Invalid value error');
    if (!isRoot && edgeCharacters.length === 0) {
      throw new Error(
        'Invalid edge charactes for non-root node: ' + edgeCharacters
      );
    }
    if (childNodes === null) {
      throw new Error('The childNodes argument was null');
    }
    NodeUtil.ensureNoDuplicateEdge(childNodes);
    if (childNodes.length === 0) {
      if (value === '') {
        return new StringNodeLeafVoidValue(edgeCharacters);
      } else if (value !== null) {
        return new StringNodeLeafWithValue(edgeCharacters, value);
      } else {
        return new StringNodeLeafWithValue(edgeCharacters);
      }
    } else {
      if (value === '') {
        return new StringNodeNonLeafVoidValue(edgeCharacters, childNodes);
      } else if (value === null) {
        return new StringNodeNonLeafNullValue(edgeCharacters, childNodes);
      } else {
        return new StringNodeDefault(edgeCharacters, value, childNodes);
      }
    }
  }
}
