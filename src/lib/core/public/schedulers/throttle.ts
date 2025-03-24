
type ThrottledFunction<F extends (...args: any[]) => void> = F & {
  cancel: () => void;
  flush: () => void;
};

export default function throttle<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
  leading = true,
  trailing = true,
  thisArg?: any,
): ThrottledFunction<F> {

  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function');
  }

  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    throw new TypeError('ms must be a non-negative number');
  }

  let lastRunTime: number | undefined;
  let timeout: NodeJS.Timeout | undefined;
  let pendingArgs: Parameters<F> | undefined;

  const throttled = Object.assign(
    function (...args: Parameters<F>) {
      const now = Date.now();

      const runNow = leading && lastRunTime === undefined;

      if (runNow) {
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
      } else if (trailing) {
        pendingArgs = args;
        timeout = setTimeout(() => {
          lastRunTime = Date.now();
          fn.apply(thisArg, pendingArgs!);
          pendingArgs = undefined;
          timeout = undefined;
        }, ms - timeSinceLastRun);
      }
    },
    {
      cancel: () => {
        if (timeout !== undefined) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        pendingArgs = undefined;
      },
      flush: () => {
        if (timeout !== undefined) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        if (pendingArgs !== undefined) {
          lastRunTime = Date.now();
          fn.apply(thisArg, pendingArgs);
          pendingArgs = undefined;
        }
      },
    }
  ) as ThrottledFunction<F>;

  return throttled;
}
