export class VoidValue {
  constructor() {}
  hashCode() {
    return 1;
  }
  equals(obj: Object) {
    return obj instanceof VoidValue;
  }
  toString() {
    return '-';
  }
  static SINGLETON = new VoidValue();
}
