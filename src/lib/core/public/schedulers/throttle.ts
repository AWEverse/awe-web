export default function throttle<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
): (...args: Parameters<F>) => void {
  // If shouldRunFirst is false, we want to delay the very first call.
  // Otherwise, we start with 0 so that the first call is executed immediately.
  let lastExecutionTime = shouldRunFirst ? 0 : Date.now();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<F>;

  // Helper to invoke the function and update the last execution timestamp.
  const invoke = () => {
    lastExecutionTime = Date.now();
    timeoutId = null;
    fn(...lastArgs);
  };

  return (...args: Parameters<F>) => {
    const now = Date.now();
    lastArgs = args;

    // For the very first call (only when shouldRunFirst is true),
    // execute immediately.
    if (shouldRunFirst && lastExecutionTime === 0) {
      lastExecutionTime = now;
      fn(...args);
      return;
    }

    // Calculate how much time is left before we can invoke fn again.
    const remaining = ms - (now - lastExecutionTime);

    // If the wait period has passed, execute immediately.
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      invoke();
    }
    // Otherwise, if there isn’t a scheduled call yet, schedule one.
    else if (!timeoutId) {
      timeoutId = setTimeout(invoke, remaining);
    }
  };
}
