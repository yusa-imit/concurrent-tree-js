import Node from '../radix/node/Node';
import { PrettyPrintable } from '../radix/node/util/PrettyPrintable';

class SavedString {
  value: string = "";
  constructor(value?: any){
    this.value = value;
  }
  append(target: string){
    this.value = this.value + target;
    return this;
  }
}

type type1Func = [tree: PrettyPrintable];
type type2Func = [tree: PrettyPrintable, appendable: SavedString];
type type3Func = [node: Node, sb: SavedString, prefix: string, isTail: boolean, isRoot: boolean];
export abstract class PrettyPrinter {
  static prettyPrint(tree: PrettyPrintable): string;
  static prettyPrint(tree: PrettyPrintable, appendable: SavedString): void;
  static prettyPrint(
    node: Node,
    sb: SavedString,
    prefix: string,
    isTail: boolean,
    isRoot: boolean
  ): void;
  static prettyPrint(arg1: PrettyPrintable | Node, arg2?: SavedString, arg3?: string, arg4?: boolean, arg5?: boolean): string | void {
    if (arguments.length === 1) {
      const [tree]: type1Func = [arg1] as type1Func;
      let sb = new SavedString("");
      this.prettyPrint(tree.getNode(), sb, '', true, true);
      return sb.value;
    }
    else if (arguments.length === 2) {
      const [tree, appendable]: type2Func = [arg1, arg2] as type2Func;
      this.prettyPrint(tree.getNode(), appendable, "", true, true);
    }
    else if(arguments.length === 5) {
      try{
        const [node, sb, prefix, isTail, isRoot]: type3Func = [arg1, arg2, arg3, arg4, arg5] as type3Func;
        const label = new SavedString("");
        if(isRoot){
          label.append("○")
          if(node.getIncomingEdge().length > 0){
            label.append(" ");
          }
        }
        label.append(node.getIncomingEdge());
        if(node.getValue()!==null){
          label.append(" ("+node.getValue()+")");
        }
        sb.append(prefix).append(isTail ? isRoot ? "" : "└── ○ " : "├── ○ ").append(label.value).append('\n');
        const children = node.getOutgoingEdges();
        for(var i=0; i<children.length-1; i++){
          this.prettyPrint(children[i], sb, prefix + (isTail ? isRoot ? "" : "    " : "│   "), false, false);
        }
        if(!(children.length===0)){
          this.prettyPrint(children[children.length-1], sb,  prefix + (isTail ? isRoot ? "" : "    " : "│   "), true, false);
        }
      }
      catch(e){
        console.log(e);
        throw new Error("Unkown Error occured on type-3 pretty printer function. See the description above");
      }
    }
    else {
      throw new Error("Arugments are not available in this function");
    }
  }
}