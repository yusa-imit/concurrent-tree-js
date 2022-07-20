import Node from '../radix/node/Node';
export class NodeKeyPair {
  public node: Node;
  public key: string;
  constructor(node: Node, key: string) {
    this.node = node;
    this.key = key;
  }
}
