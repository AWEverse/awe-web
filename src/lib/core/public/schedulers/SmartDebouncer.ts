import { IDisposable } from "../misc";

/**
 * Smart debouncer with backpressure handling
 */
export default class SmartDebouncer<T> implements IDisposable {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastCallTime = 0;
  private pendingValue: T | null = null;
  private isSaving = false;

  constructor(
    private callback: (value: T) => Promise<void>,
    private delay: number,
    private maxDelay = 10000
  ) { }

  /**
   * Schedule execution with smart timing
   */
  schedule(value: T): void {
    this.pendingValue = value;
    const now = Date.now();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.isSaving || (now - this.lastCallTime > this.maxDelay)) {
      this.executeWhenPossible();
      return;
    }

    this.timer = setTimeout(() => {
      this.executeWhenPossible();
    }, this.delay);
  }

  /**
   * Execute as soon as previous operation completes
   */
  private executeWhenPossible(): void {
    if (this.isSaving || !this.pendingValue) return;

    const valueToSave = this.pendingValue;
    this.pendingValue = null;
    this.lastCallTime = Date.now();
    this.isSaving = true;

    this.callback(valueToSave).finally(() => {
      this.isSaving = false;

      // If new value arrived during save, process it
      if (this.pendingValue) {
        setTimeout(() => this.executeWhenPossible(), 0);
      }
    });
  }

  /**
   * Force immediate execution
   */
  flush(): Promise<void> {
    if (!this.pendingValue) return Promise.resolve();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.isSaving) {
      return new Promise((resolve) => {
        const checkAndExecute = () => {
          if (this.isSaving) {
            setTimeout(checkAndExecute, 50);
          } else {
            this.executeWhenPossible();
            resolve();
          }
        };
        checkAndExecute();
      });
    } else {
      this.executeWhenPossible();
      return Promise.resolve();
    }
  }

  /**
   * Cancel pending execution
   */
  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
