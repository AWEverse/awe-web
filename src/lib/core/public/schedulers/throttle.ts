export default function throttle<F extends AnyToVoidFunction>(
  fn: F,
  ms: number,
  shouldRunFirst = true,
) {
  let timeout: number | undefined;
  let isPending: boolean;
  let args: Parameters<F>;

  const execute = () => {
    if (isPending) {
      isPending = false;
      fn(...args);
      timeout = self.setTimeout(execute, ms);
    } else {
      timeout = undefined;
    }
  };

  return (..._args: Parameters<F>) => {
    isPending = true;
    args = _args;

    if (!timeout) {
      if (shouldRunFirst) {
        isPending = false;
        fn(...args);
      }
      timeout = self.setTimeout(execute, ms);
    }
  };
}
