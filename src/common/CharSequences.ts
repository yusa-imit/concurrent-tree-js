import Iterator from './Iterator';

export class CharSequences {
  public static geneerateSuffixes(input: string): Iterable<string> {
    return new Iterator(input);
  }
}
