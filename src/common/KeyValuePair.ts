export interface KeyValuePair<T> {
  getKey(): string;
  getValue(): T;
  equals(value: T): boolean;
  hashCode(): number;
  toString(): string;
}