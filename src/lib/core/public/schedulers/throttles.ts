import fastRaf from './fastRaf';
import onTickEnd from './onTickEnd';

export type Scheduler = typeof requestAnimationFrame | typeof onTickEnd;

export function throttleWith<F extends AnyToVoidFunction>(schedulerFn: Scheduler, fn: F) {
  let waiting = false;
  let args: Parameters<F>;

  return (..._args: Parameters<F>) => {
    args = _args;

    if (!waiting) {
      waiting = true;

      schedulerFn(() => {
        waiting = false;
        fn(...args);
      });
    }
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
