import { KeyValuePair } from '../common/KeyValuePair';
import { HashCode } from './HashCode';

export class KeyValuePairImpl<T> implements KeyValuePair<T> {
  key: string;
  value: T;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
  getKey(): string {
    return this.key;
  }
  getValue(): T {
    return this.value;
  }
  equals(o: Object): boolean {
    if (this === o) return true;
    if (o === null || typeof o !== typeof this) return false;
    const that: KeyValuePairImpl<T> = o as KeyValuePairImpl<T>;
    return this.key === that.key;
  }
  hashCode(): number {
    return HashCode(this.key);
  }
  toString(): string {
    return `(${this.key}, ${this.value}`;
  }
}
