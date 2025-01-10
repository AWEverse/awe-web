import { requestIdleExecution, throttleWith } from '../schedulers';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import { signal } from '../signals';

const AUTO_END_TIMEOUT = 1000;

let counter = 0;
let counterBlocking = 0;

const IsAnimating = signal(false);
const IsBlockingAnimating = signal(false);

export { IsAnimating as getIsHeavyAnimating, IsBlockingAnimating as getIsBlockingHeavyAnimating };

export function dispatchHeavyAnimation(duration = AUTO_END_TIMEOUT, isBlocking = false) {
  counter++;
  IsAnimating.value = true;

  if (isBlocking) {
    counterBlocking++;
    IsBlockingAnimating.value = true;
  }

  const timeout = setTimeout(() => {
    counter--;
    IsAnimating.value = counter > 0;

    if (isBlocking) {
      counterBlocking--;
      IsBlockingAnimating.value = counterBlocking > 0;
    }
  }, duration);

  return () => clearTimeout(timeout);
}

export function onIdleComplete(callback: NoneToVoidFunction) {
  requestIdleExecution(() => {
    if (!IsAnimating.value) {
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
