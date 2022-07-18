/**
 * Get ReentrantLock from
 * https://github.com/GiviMAD/PromiseReentrantLock
 *
 * Partially forked
 *
 * @author GiviMad
 */

type ReentrantLockReleaser = () => void;
interface ReentrantLockedChainItem {
  (): void;
  next?: ReentrantLockedChainItem;
}
export class ReentrantLock {
  private current?: ReentrantLockedChainItem;
  private last?: ReentrantLockedChainItem;
  private next = () => {
    if (this.current === this.last) {
      this.current = undefined;
      this.last = undefined;
    } else if (this.current && this.current.next) {
      this.current.next();
    }
  };
  public acquire(): Promise<ReentrantLockReleaser> {
    if (!this.last) {
      this.current = this.last = () => null;
      return Promise.resolve(this.next);
    } else {
      return new Promise((resolve, reject) => {
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
