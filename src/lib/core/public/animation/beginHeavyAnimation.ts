import { createSignal } from '@/lib/modules/signals';
import { requestIdleExecution, throttleWith } from '../schedulers';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

const AUTO_END_TIMEOUT = 1000;

let counter = 0;
let counterBlocking = 0;

const [getIsAnimating, setIsAnimating] = createSignal(false);
const [getIsBlockingAnimating, setIsBlockingAnimating] = createSignal(false);

export const getIsHeavyAnimating = getIsAnimating;
export { getIsBlockingAnimating };

export function beginHeavyAnimation(duration = AUTO_END_TIMEOUT, isBlocking = false) {
  counter++;
  setIsAnimating(counter === 1);

  if (isBlocking) {
    counterBlocking++;
    setIsBlockingAnimating(counterBlocking === 1);
  }

  const timeout = window.setTimeout(onEnd, duration);

  function onEnd() {
    clearTimeout(timeout);

    counter--;
    setIsAnimating(counter === 0);

    if (isBlocking) {
      counterBlocking--;
      setIsBlockingAnimating(counterBlocking === 0);
    }
  }

  return onEnd;
}

export function onIdleComplete(cb: NoneToVoidFunction) {
  requestIdleExecution(() => {
    if (!getIsAnimating()) {
      cb();
    } else {
      requestMeasure(() => {
        onIdleComplete(cb);
      });
    }
  });
}

export function throttleWithFullyIdle<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith(onIdleComplete, fn);
}
