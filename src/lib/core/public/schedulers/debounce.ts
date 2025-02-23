// Ensure AnyFunction is defined (if not defined elsewhere)
type AnyFunction = (...args: any[]) => any;

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
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<Awaited<ReturnType<F>>> | null = null;
  let pendingResolve: ((value: Awaited<ReturnType<F>>) => void) | null = null;
  let pendingReject: ((reason?: any) => void) | null = null;
  let lastArgs: Parameters<F> | null = null;
  let immediateResult: Promise<Awaited<ReturnType<F>>> | undefined = undefined;

  const invokeFunction = (args: Parameters<F>): Promise<Awaited<ReturnType<F>>> =>
    Promise.resolve(fn(...args));

  const invokeTrailing = () => {
    timer = null;
    if (shouldRunLast && lastArgs) {
      invokeFunction(lastArgs)
        .then((result) => pendingResolve?.(result))
        .catch((error) => pendingReject?.(error))
        .finally(() => {
          pendingPromise = null;
          pendingResolve = null;
          pendingReject = null;
          lastArgs = null;
        });
    } else {
      pendingResolve?.(immediateResult as unknown as Awaited<ReturnType<F>>);
      pendingPromise = null;
      pendingResolve = null;
      pendingReject = null;
      lastArgs = null;
    }
  };

  const debounced = (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
    const isFirstCall = timer === null;
    lastArgs = args;

    if (isFirstCall) {
      pendingPromise = new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;
      });

      if (shouldRunFirst) {
        immediateResult = invokeFunction(args);
        if (!shouldRunLast) {
          immediateResult.catch((error) => {
            pendingReject?.(error);
            timer = null;
            pendingPromise = null;
            pendingResolve = null;
            pendingReject = null;
            lastArgs = null;
          });
        }
      }

      timer = globalThis.setTimeout(invokeTrailing, ms);
      return pendingPromise;
    } else {
      if (timer)
        clearTimeout(timer);
      timer = globalThis.setTimeout(invokeTrailing, ms);
      return pendingPromise!;
    }
  };

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

  debounced.isDebounced = () => timer !== null;

  return debounced as DebounceReturnType<F>;
}
