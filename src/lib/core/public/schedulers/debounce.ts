
export default function debounce<F extends AnyToVoidFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
  shouldRunLast = true,
) {
  let waitingTimeout: number | undefined;

  return (...args: Parameters<F>) => {
    if (waitingTimeout) {
      clearTimeout(waitingTimeout);
      waitingTimeout = undefined;
    } else if (shouldRunFirst) {
      fn(...args);
    }

    // eslint-disable-next-line no-restricted-globals
    waitingTimeout = self.setTimeout(() => {
      if (shouldRunLast) {
        fn(...args);
      }

      waitingTimeout = undefined;
    }, ms);
  };
}
