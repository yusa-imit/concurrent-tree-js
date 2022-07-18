import Node from './node/Node';

export class SearchResult {
  readonly key: string;
  readonly nodeFound: Node;
  readonly charsMatched: number;
  readonly charsMatchedInNodeFound: number;
  readonly parentNode: Node;
  readonly ParentNodesParent: Node;
  readonly classification: SearchResult.Classification;
  constructor(
    key: string,
    nodeFound: Node,
    charsMatched: number,
    charsMatchedInNodeFound: number,
    parentNode: Node,
    parentNodesParent: Node
  ) {
    this.key = key;
    this.nodeFound = nodeFound;
    this.charsMatched = charsMatched;
    this.charsMatchedInNodeFound = charsMatchedInNodeFound;
    this.parentNode = parentNode;
    this.ParentNodesParent = parentNodesParent;
    this.classification = this.classify(
      key,
      nodeFound,
      charsMatched,
      charsMatchedInNodeFound
    );
  }
  protected classify(
    key: string,
    nodeFound: Node,
    charsMatched: number,
    charsMatchedInNodeFound: number
  ) {
    if (charsMatched === key.length) {
      if (charsMatchedInNodeFound === nodeFound.getIncomingEdge().length) {
        return SearchResult.Classification.EXACT_MATCH;
      } else if (charsMatchedInNodeFound < nodeFound.getIncomingEdge().length) {
        return SearchResult.Classification.KEY_ENDS_MID_EDGE;
      }
    } else if (charsMatched < key.length) {
      if (charsMatchedInNodeFound === nodeFound.getIncomingEdge().length) {
        return SearchResult.Classification.INCOMPLETE_MATCH_TO_END_OF_EDGE;
      } else if (charsMatchedInNodeFound < nodeFound.getIncomingEdge().length) {
        return SearchResult.Classification.INCOMPLETE_MATCH_TO_MIDDLE_OF_EDGE;
      }
    }
    throw new Error('Unexpected failure to classify SearchResult: ' + this);
  }
  public toString() {
    return JSON.stringify({
      SearchResult: {
        key: this.key,
        nodeFound: this.nodeFound,
        charsMatched: this.charsMatched,
        charsMatchedInNodeFound: this.charsMatchedInNodeFound,
        parentNode: this.parentNode,
        parentNodesParent: this.ParentNodesParent,
        classification: this.classification,
      },
    });
  }
}
export namespace SearchResult {
  export enum Classification {
    EXACT_MATCH,
    INCOMPLETE_MATCH_TO_END_OF_EDGE,
    INCOMPLETE_MATCH_TO_MIDDLE_OF_EDGE,
    KEY_ENDS_MID_EDGE,
    INVALID,
  }
}
