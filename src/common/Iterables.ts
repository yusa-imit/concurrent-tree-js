export default class Iterables {
  public static toArray<T>(iterable: Iterable<T>): Array<T> {
    const list = new Array<T>();
    for (const v of iterable) {
      list.push(v);
    }
    return list;
  }
  public static toSet<T>(iterable: Iterable<T>): Set<T> {
    const set = new Set<T>();
    for (const v of iterable) {
      set.add(v);
    }
    return set;
  }
  public static toString(iterable: Iterable<any>): string {
    return JSON.stringify(this.toArray(iterable));
  }
  public static count(iterable: Iterable<any>): number {
    let count = 0;
    Iterables.toArray(iterable).forEach(()=>{count++});
    return count;
  }
}
