export default function debounce<F extends (...args: any[]) => void>(
  fn: F,
  ms: number,
  shouldRunFirst: boolean = true,
  shouldRunLast: boolean = true,
  thisArg?: any,
): (...args: Parameters<F>) => void {
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function');
  }

  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    throw new TypeError('ms must be a non-negative number');
  }

  let waitingTimeout: NodeJS.Timeout | undefined;

  return function (...args: Parameters<F>) {
    if (waitingTimeout !== undefined) {
      clearTimeout(waitingTimeout);
      waitingTimeout = undefined;
    } else if (shouldRunFirst) {
      fn.apply(thisArg, args);
    }

    waitingTimeout = setTimeout(() => {
      if (shouldRunLast) {
        fn.apply(thisArg, args);
      }
      waitingTimeout = undefined;
    }, ms);
  };
}
