export type DebounceReturnType<F extends AnyFunction> = {
  (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>>;
  clearTimeout(): void;
  isDebounced(): boolean;
};

export default function debounce<F extends AnyFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true,
): DebounceReturnType<F> {
  // Timer for the trailing call; null means no burst is active.
  let timer: ReturnType<typeof setTimeout> | null = null;
  // Promise (and its resolvers) for the current burst.
  let pendingPromise: Promise<Awaited<ReturnType<F>>> | null = null;
  let pendingResolve: ((value: Awaited<ReturnType<F>>) => void) | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;
  // The latest arguments (used for the trailing call).
  let lastArgs: Parameters<F> | null = null;
  // In the case of an immediate (leading) call when trailing is disabled,
  // we cache the result so that subsequent calls return it.
  let immediateResult: Awaited<ReturnType<F>> | undefined = undefined;

  const debounced = (
    ...args: Parameters<F>
  ): Promise<Awaited<ReturnType<F>>> => {
    // Determine if this is the first call of a burst.
    const isFirstCall = timer === null;
    lastArgs = args;

    if (isFirstCall) {
      // Begin a new burst by creating a new promise.
      pendingPromise = new Promise<Awaited<ReturnType<F>>>(
        (resolve, reject) => {
          pendingResolve = resolve;
          pendingReject = reject;
        },
      );

      if (shouldRunFirst) {
        // On the leading edge, execute immediately.
        try {
          immediateResult = fn(...args);
        } catch (error) {
          // If the immediate call fails, reject the promise.
          pendingReject?.(error);
          // Also clear the burst.
          timer = null;
          pendingPromise = null;
          pendingResolve = null;
          pendingReject = null;
          lastArgs = null;
          return Promise.reject(error);
        }
      }

      // Schedule the trailing call (or resolve with the immediate result)
      // after the specified delay.
      timer = globalThis.setTimeout(() => {
        timer = null;
        if (shouldRunLast && lastArgs) {
          try {
            const result = fn(...lastArgs);
            pendingResolve?.(result);
          } catch (error) {
            pendingReject?.(error);
          }
        } else {
          // When trailing is disabled, resolve with the immediate result.
          pendingResolve?.(immediateResult as Awaited<ReturnType<F>>);
        }
        // Clear the burst state.
        pendingPromise = null;
        pendingResolve = null;
        pendingReject = null;
        lastArgs = null;
      }, ms);

      return pendingPromise;
    } else {
      // Within a burst, cancel the current trailing call...
      clearTimeout(timer!);
      timer = globalThis.setTimeout(() => {
        timer = null;
        if (shouldRunLast && lastArgs) {
          try {
            const result = fn(...lastArgs);
            pendingResolve?.(result);
          } catch (error) {
            pendingReject?.(error);
          }
        } else {
          pendingResolve?.(immediateResult as Awaited<ReturnType<F>>);
        }
        pendingPromise = null;
        pendingResolve = null;
        pendingReject = null;
        lastArgs = null;
      }, ms);
      // And return the same promise as the burst.
      return pendingPromise!;
    }
  };

  // Expose a method to cancel a pending (debounced) call.
  debounced.clearTimeout = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      pendingReject?.(new Error("Debounce cancelled"));
      pendingPromise = null;
      pendingResolve = null;
      pendingReject = null;
      lastArgs = null;
    }
  };

  // Expose a method to know if there is an active debounce timer.
  debounced.isDebounced = () => timer !== null;

  return debounced as DebounceReturnType<F>;
}
