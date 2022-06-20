type ReentrantLockReleaser = () => void;
interface ReentrantLockedChainItem {
  (): void;
  next?: ReentrantLockedChainItem;
}
export class ReentrantLock {
  private current?: ReentrantLockedChainItem;
  private last?: ReentrantLockedChainItem;
  public resolver?: null | Promise<ReentrantLockReleaser>;
  private next = () => {
    if (this.current === this.last) {
      this.current = undefined;
      this.last = undefined;
    } else if (this.current && this.current.next) {
      this.current.next();
    }
  };
  public acquire(): void {
    if (!this.last) {
      this.current = this.last = () => null;
      this.resolver = Promise.resolve(this.next);
    } else {
      this.resolver = new Promise((resolve, reject) => {
        const lockChainItem = () => {
          this.current = lockChainItem;
          resolve(this.next);
        };
        this.last = (this
          .last as ReentrantLockedChainItem).next = lockChainItem;
      });
    }
  }
}
