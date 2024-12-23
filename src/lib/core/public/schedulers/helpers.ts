import fastRaf from './fastRaf';
import onTickEnd from './onTickEnd';

export function onIdle(cb: NoneToVoidFunction, timeout?: number) {
  if (self.requestIdleCallback) {
    self.requestIdleCallback(cb, { timeout });
  } else {
    onTickEnd(cb);
  }
}

export const pause = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });

export const rafPromise = () =>
  new Promise<void>(resolve => {
    fastRaf(resolve);
  });
