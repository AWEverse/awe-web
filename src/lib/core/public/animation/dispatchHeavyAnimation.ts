import { createSignal } from '@/lib/modules/signals';
import { requestIdleExecution, throttleWith } from '../schedulers';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

const AUTO_END_TIMEOUT = 1000;

let counter = 0;
let counterBlocking = 0;

const [getIsAnimating, setIsAnimating] = createSignal(false);
const [getIsBlockingAnimating, setIsBlockingAnimating] = createSignal(false);

export {
  getIsAnimating as getIsHeavyAnimating,
  getIsBlockingAnimating as getIsBlockingHeavyAnimating,
};

export function dispatchHeavyAnimation(duration = AUTO_END_TIMEOUT, isBlocking = false) {
  counter += 1;
  setIsAnimating(counter === 1);

  if (isBlocking) {
    counterBlocking += 1;
    setIsBlockingAnimating(counterBlocking === 1);
  }

  const timeout = window.setTimeout(onEnd, duration);

  function onEnd() {
    clearTimeout(timeout);

    counter -= 1;
    setIsAnimating(counter === 0);

    if (isBlocking) {
      counterBlocking -= 1;
      setIsBlockingAnimating(counterBlocking === 0);
    }
  }

  return onEnd;
}

export function onIdleComplete(callback: NoneToVoidFunction) {
  requestIdleExecution(() => {
    if (!getIsAnimating()) {
      callback();
    } else {
      requestMeasure(() => {
        onIdleComplete(callback);
      });
    }
  });
}

export function throttleWithIdleComplete<F extends AnyToVoidFunction>(fn: F) {
  return throttleWith(onIdleComplete, fn);
}
