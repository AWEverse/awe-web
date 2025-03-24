interface DebouncedFunction<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): void;
  cancel: () => void;
  flush: () => void;
}

export default function debounce<F extends (...args: any[]) => any>(
  fn: F,
  wait: number,
  leading = false,
  trailing = true,
): DebouncedFunction<F> {
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function');
  }

  if (typeof wait !== 'number' || isNaN(wait) || wait < 0) {
    throw new TypeError('wait must be a non-negative number');
  }


  let timeout: NodeJS.Timeout | undefined;
  let lastArgs: Parameters<F> | undefined;
  let lastThis: any;

  const debouncedFunction = function (this: any, ...args: Parameters<F>) {
    lastArgs = args;
    lastThis = this;

    const callNow = leading && timeout === undefined;

    if (timeout !== undefined) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = undefined;
      if (trailing) {
        if (lastArgs !== undefined) {
          fn.apply(lastThis, lastArgs);
        }
      }
    }, wait);

    if (callNow) {
      fn.apply(lastThis, lastArgs);
    }
  };

  const cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  const flush = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
      if (lastArgs !== undefined) {
        fn.apply(lastThis, lastArgs);
      }
    }
  };

  const debounced: DebouncedFunction<F> = Object.assign(debouncedFunction, {
    cancel,
    flush,
  });

  return debounced;
}
