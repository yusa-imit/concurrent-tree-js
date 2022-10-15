import { Strings } from '../common/Strings';
import { ConcurrentRadixTree } from '../radix/ConcurrentRadixTree';
import NodeFactory from '../radix/node/NodeFactory';
import { ConcurrentSuffixTreeImpl } from './Impl';

export class LCSubstringSolver<T> extends ConcurrentRadixTree<T> {
  suffixTree;
  originalDocuments;
  constructor(nodeFactory: NodeFactory<T>) {
    super(nodeFactory);
    this.suffixTree = new ConcurrentSuffixTreeImpl(nodeFactory);
    this.originalDocuments = new Set<string>();
  }
  async add(document: string) {
    if (document === null) {
      throw new TypeError('The document argument was null');
    }
    if (document.length === 0) {
      throw new TypeError('The document argument was zero-length');
    }
    const release = await this.suffixTree.acquireLock();
    try {
      const documentString = String(document);
      if (this.originalDocuments.has(documentString)) {
        return false;
      }
      this.originalDocuments.add(documentString);
      this.addSuffixesToRadixTree(documentString);
      return true;
    } finally {
      release();
    }
  }
  addSuffixesToRadixTree(keyAsString: string) {
    const suffixes = Strings.generateSuffixes(keyAsString);
    for (const suffix of suffixes) {
      let originalKeyRefs = this.suffixTree.getValueForExactKey(suffix) as Set<
        string
      >;
      if (originalKeyRefs === null) {
        originalKeyRefs = new Set<string>();
      }
      originalKeyRefs.add(keyAsString);
    }
  }
  getLongestCommonSubstring() {
    return this.suffixTree.getLongestCommonSubstring(this.originalDocuments);
  }
}
