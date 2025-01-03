import fastRaf from './fastRaf';
import { default as requestIdleCallbackFallback } from './onTickEnd';

export function requestIdleExecution(cb: NoneToVoidFunction, timeout?: number) {
  if (self.requestIdleCallback) {
    self.requestIdleCallback(cb, { timeout });
  } else {
    requestIdleCallbackFallback(cb);
  }
}

export const pause = (ms: number) => {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
};

export const rafPromise = () => {
  return new Promise<void>(resolve => {
    fastRaf(resolve);
  });
};
