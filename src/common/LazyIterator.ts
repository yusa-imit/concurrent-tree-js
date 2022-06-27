//type LazyIteratorState = "READY" | "NOT_READY" | "DONE" | "FAILED";
enum LazyIteratorState {READY, NOT_READY, DONE, FAILED};
export abstract class LazyIterator<T> implements Iterator<T|null>{
  nextValue: T|null = null;
  state: LazyIteratorState = LazyIteratorState.NOT_READY;
  remove(): void {
    throw new Error("Iterator.remove() is not supported.");
  }
  hasNext(): boolean{
    if(this.state === LazyIteratorState.FAILED){
      throw new Error("This iterator is in an inconsistent state, and can no longer be used, " +
      "due to an exception previously thrown by the computeNext() method")
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
    if(this.state!==LazyIteratorState.DONE){
      this.state = LazyIteratorState.READY;
      return true;
    }
    return false;
  }
  next(...args: [] | [undefined]): IteratorResult<T, any> {
    throw new Error("Method not implemented.");
  }
  next(): T | null{
    if(!this.hasNext()){
      throw new NoSuchElementException();
    }
    this.state = LazyIteratorState.NOT_READY;
    return this.nextValue;
  }
  protected endOfData(): null{
    this.state = LazyIteratorState.DONE;
    return null;
  }
  abstract computeNext(): T;
}

