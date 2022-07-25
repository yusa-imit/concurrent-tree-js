import { CompareTo } from '../../../lib/CompareTo';
import Node from '../Node';

export abstract class NodeUtil {
  public static binarySearchForEdge(
    childNodes: Node[],
    edgeFirstCharacter: string
  ) {
    let low = 0;
    let high = childNodes.length - 1;
    while (low <= high) {
      let mid = (low + high) >>> 1;
      const midVal = childNodes[mid];
      const cmp = CompareTo(
        midVal.getIncomingEdgeFirstCharacter(),
        edgeFirstCharacter
      );
      if (cmp < 0) {
        low = mid + 1;
      } else if (cmp > 0) {
        high = mid - 1;
      } else return mid;
    }
    return -(low + 1);
  }
  public static ensureNoDuplicateEdge(nodes: Node[]): void {
    const set = new Set();
    for (const node of nodes) {
      set.add(node.getIncomingEdgeFirstCharacter());
    }
    if (nodes.length !== set.size) {
      throw new Error(
        'Duplicate edge detected in list of nodes supplied ' + nodes
      );
    }
  }
}
