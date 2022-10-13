import { Nullable } from '../lib/Nullable';

//type LazyIteratorState = "READY" | "NOT_READY" | "DONE" | "FAILED";
enum LazyIteratorState {
  READY,
  NOT_READY,
  DONE,
  FAILED,
}
export abstract class LazyIterator<T> implements Iterator<T | null> {
  nextValue: T | null = null;
  state: LazyIteratorState = LazyIteratorState.NOT_READY;
  remove(): void {
    throw new Error('Iterator.remove() is not supported.');
  }
  hasNext(): boolean {
    if (this.state === LazyIteratorState.FAILED) {
      throw new Error(
        'This iterator is in an inconsistent state, and can no longer be used, ' +
          'due to an exception previously thrown by the computeNext() method'
      );
    }
    switch (this.state) {
      case LazyIteratorState.DONE:
        return false;
      case LazyIteratorState.READY:
        return true;
    }
    return this.tryToComputeNext();
  }
  tryToComputeNext(): boolean {
    this.state = LazyIteratorState.FAILED;
    this.nextValue = this.computeNext();
    // @ts-ignore
    if (this.state !== LazyIteratorState.DONE) {
      this.state = LazyIteratorState.READY;
      return true;
    }
    return false;
  }
  next(): IteratorResult<T | null, Nullable<T>> {
    if (!this.hasNext()) {
      return { value: null, done: true };
    }
    this.state = LazyIteratorState.NOT_READY;
    return { value: this.nextValue, done: false };
  }
  protected endOfData(): null {
    this.state = LazyIteratorState.DONE;
    return null;
  }
  protected abstract computeNext(): Nullable<T>;
}
