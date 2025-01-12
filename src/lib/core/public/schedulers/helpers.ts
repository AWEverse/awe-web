import fastRaf from './fastRaf';
import { default as requestIdleCallbackFallback } from './onTickEnd';

export const requestIdleExecution = (cb: NoneToVoidFunction, timeout?: number) => {
  (self.requestIdleCallback || requestIdleCallbackFallback)(cb, { timeout });
};

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
