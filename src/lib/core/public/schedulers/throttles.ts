import fastRaf from "./fastRaf";
import onTickEnd from "./onTickEnd";

export type Scheduler = typeof requestAnimationFrame | typeof onTickEnd;

export function throttleWith<F extends (...args: any[]) => void>(
  schedulerFn: Scheduler,
  fn: F
): (...args: Parameters<F>) => void {
  let isScheduled = false;
  let lastArgs: Parameters<F> | null = null;

  return (...args: Parameters<F>) => {
    lastArgs = args;

    if (isScheduled) return;

    isScheduled = true;
    schedulerFn(() => {
      if (lastArgs) {
        fn(...lastArgs);
      }
      isScheduled = false;
      lastArgs = null;
    });
  };
}


export function throttleWithTickEnd<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith(onTickEnd, fn);
}

export function throttleWithRAF<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith(requestAnimationFrame, fn);
}

export function throttleWithFastRAF<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith(fastRaf, fn);
}
