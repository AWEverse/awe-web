type AnyFunction = (...args: any[]) => any;

export type DebounceReturnType<F extends AnyFunction> = {
  (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>>;
  clearTimeout(): void;
  isDebounced(): boolean;
};

class Debouncer<F extends AnyFunction> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private deferred: {
    promise: Promise<Awaited<ReturnType<F>>>;
    resolve: (value: Awaited<ReturnType<F>>) => void;
    reject: (reason?: any) => void;
  } | null = null;
  private lastArgs: Parameters<F> | null = null;
  private immediateResult: Promise<Awaited<ReturnType<F>>> | null = null;
  private readonly fn: F;
  private readonly ms: number;
  private readonly shouldRunFirst: boolean;
  private readonly shouldRunLast: boolean;

  constructor(fn: F, ms: number, shouldRunFirst: boolean, shouldRunLast: boolean) {
    if (!shouldRunFirst && !shouldRunLast) {
      throw new Error("Either shouldRunFirst or shouldRunLast must be true.");
    }
    this.fn = fn;
    this.ms = ms;
    this.shouldRunFirst = shouldRunFirst;
    this.shouldRunLast = shouldRunLast;
  }

  private createDeferred() {
    let resolve: (value: Awaited<ReturnType<F>>) => void = () => { };
    let reject: (reason?: any) => void = () => { };
    const promise = new Promise<Awaited<ReturnType<F>>>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  private invokeFunction(args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    return Promise.resolve(this.fn(...args));
  }

  private resetState(): void {
    this.timer = null;
    this.deferred = null;
    this.lastArgs = null;
    this.immediateResult = null;
  }

  private invokeTrailing(): void {
    if (this.shouldRunLast && this.lastArgs) {
      this.invokeFunction(this.lastArgs)
        .then(result => this.deferred?.resolve(result))
        .catch(error => this.deferred?.reject(error))
        .finally(() => this.resetState());
    } else if (this.immediateResult) {
      this.immediateResult
        .then(result => this.deferred?.resolve(result))
        .catch(error => this.deferred?.reject(error))
        .finally(() => this.resetState());
    } else {
      this.resetState();
    }
  }

  public debounced(...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    this.lastArgs = args;
    const isFirstCall = this.timer === null;

    if (isFirstCall) {
      this.deferred = this.createDeferred();

      if (this.shouldRunFirst) {
        this.immediateResult = this.invokeFunction(args);

        if (!this.shouldRunLast) {
          this.immediateResult.catch(error => {
            this.deferred?.reject(error);
            this.resetState();
          });
        }
      }

      this.timer = setTimeout(() => this.invokeTrailing(), this.ms);
      return this.deferred.promise;
    } else {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.invokeTrailing(), this.ms);
      return this.deferred!.promise;
    }
  }

  public clearTimeout(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.deferred?.reject(new Error("Debounce cancelled"));
      this.resetState();
    }
  }

  public isDebounced(): boolean {
    return this.timer !== null;
  }
}

export default function debounce<F extends AnyFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true
): DebounceReturnType<F> {
  const debouncer = new Debouncer(fn, ms, shouldRunFirst, shouldRunLast);

  const debounced = (...args: Parameters<F>) => debouncer.debounced(...args);
  debounced.clearTimeout = () => debouncer.clearTimeout();
  debounced.isDebounced = () => debouncer.isDebounced();

  return debounced as DebounceReturnType<F>;
}
