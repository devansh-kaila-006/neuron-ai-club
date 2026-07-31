/**
 * Concurrency Utilities & Mutex Locks
 * Prevents race conditions, data loss, and duplicate code collisions
 * during simultaneous team registrations and admin update operations.
 */

class AsyncMutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) next();
        } else {
          this.locked = false;
        }
      };

      if (!this.locked) {
        this.locked = true;
        resolve(release);
      } else {
        this.queue.push(() => resolve(release));
      }
    });
  }

  async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await task();
    } finally {
      release();
    }
  }
}

class KeyedMutex {
  private locks: Map<string, AsyncMutex> = new Map();

  private getLock(key: string): AsyncMutex {
    let lock = this.locks.get(key);
    if (!lock) {
      lock = new AsyncMutex();
      this.locks.set(key, lock);
    }
    return lock;
  }

  async runExclusive<T>(key: string, task: () => Promise<T>): Promise<T> {
    const lock = this.getLock(key);
    try {
      return await lock.runExclusive(task);
    } finally {
      // Cleanup unused locks if queue is empty
      if (this.locks.size > 200) {
        this.locks.clear();
      }
    }
  }
}

export const registrationMutex = new AsyncMutex();
export const passportUpdateMutex = new KeyedMutex();
export const adminActionMutex = new AsyncMutex();
