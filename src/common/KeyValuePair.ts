export interface KeyValuePair<T> {
  getKey(): string;
  getValue(): T;
  equals(object: Object): boolean;
  hashCode(): number;
  toString(): string;
}
