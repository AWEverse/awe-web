export default function throttle<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
  shouldRunFirst: boolean = true,
  thisArg?: any,
): (...args: Parameters<F>) => void {
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function');
  }

  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    throw new TypeError('ms must be a non-negative number');
  }

  let lastRunTime: number | undefined;
  let timeout: NodeJS.Timeout | undefined;
  let pendingArgs: Parameters<F> | undefined;

  return function (...args: Parameters<F>) {
    const now = Date.now();

    if (shouldRunFirst && lastRunTime === undefined) {
      lastRunTime = now;
      fn.apply(thisArg, args);
      return;
    }

    if (timeout !== undefined) {
      pendingArgs = args;
      return;
    }

    const timeSinceLastRun = lastRunTime ? now - lastRunTime : ms;

    if (timeSinceLastRun >= ms) {
      lastRunTime = now;
      fn.apply(thisArg, args);
    } else {
      pendingArgs = args;
      timeout = setTimeout(() => {
        lastRunTime = Date.now();
        fn.apply(thisArg, pendingArgs!);
        pendingArgs = undefined;
        timeout = undefined;
      }, ms - timeSinceLastRun);
    }
  };
}
