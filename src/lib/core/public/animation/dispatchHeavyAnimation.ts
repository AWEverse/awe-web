import { defferMicrotasks, onIdle, throttleWith } from "../schedulers";
import { ReadonlySignal, signal, effect } from "../signals";

const AUTO_END_TIMEOUT = 1000;

const animationState = {
  count: 0,
  isActive: signal(false),
};

const blockingAnimationState = {
  count: 0,
  isActive: signal(false),
};

const idleQueue: Array<NoneToVoidFunction> = [];

effect(() => {
  const isAnimating = animationState.isActive.value;
  const isBlocking = blockingAnimationState.isActive.value;

  if (!isAnimating && !isBlocking) {
    defferMicrotasks(() => {
      const callbacks = [...idleQueue];
      idleQueue.length = 0;
      callbacks.forEach(cb => cb());
    });
  }
});

export const getIsHeavyAnimating: ReadonlySignal<boolean> = animationState.isActive;
export const getIsBlockingHeavyAnimating: ReadonlySignal<boolean> = blockingAnimationState.isActive;

export function dispatchHeavyAnimation(
  duration = AUTO_END_TIMEOUT,
  isBlocking = false,
) {
  const state = isBlocking ? blockingAnimationState : animationState;

  state.count++;
  state.isActive.value = true;

  const timeout = setTimeout(() => {
    state.count = Math.max(0, state.count - 1);
    state.isActive.value = state.count > 0;
  }, duration);

  return () => {
    clearTimeout(timeout);
    state.count = Math.max(0, state.count - 1);
    state.isActive.value = state.count > 0;
  };
}

export function onIdleComplete(callback: NoneToVoidFunction) {
  idleQueue.push(callback);

  onIdle(() => {
    if (!animationState.isActive.value && !blockingAnimationState.isActive.value) {
      const index = idleQueue.indexOf(callback);

      if (index !== -1) {
        idleQueue.splice(index, 1);
        callback();
      }
    }
  });
}

export const throttleWithIdleComplete = <F extends AnyToVoidFunction>(fn: F) =>
  throttleWith(onIdleComplete, fn);
