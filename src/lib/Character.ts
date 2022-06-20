export default class Character {
  readonly char: string;
  constructor(char: string) {
    if (char.length !== 1) {
      throw new Error(char + ' is not a single character');
    }
    this.char = char;
  }
  toString(): string {
    return this.char;
  }
}
