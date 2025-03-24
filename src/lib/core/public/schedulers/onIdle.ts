import onTickEnd from "./onTickEnd";

const IDLE_TIMEOUT = 500;
const DEFAULT_TIME_SLICE = 5;

let onIdleCallbacks: NoneToVoidFunction[] | undefined;
let isProcessing = false;

function processCallbacks(deadline: IdleDeadline | { timeRemaining: () => number }) {
  const currentCallbacks = onIdleCallbacks;
  onIdleCallbacks = undefined;
  isProcessing = false;

  if (!currentCallbacks) return;

  while (currentCallbacks.length > 0 && deadline.timeRemaining() > 0) {
    currentCallbacks.shift()!?.();
  }

  if (currentCallbacks.length > 0) {
    onIdleCallbacks = currentCallbacks;
    scheduleCallbacks();
  }
}

function scheduleCallbacks() {
  if (isProcessing) return;

  isProcessing = true;

  if (typeof self.requestIdleCallback === 'function') {
    requestIdleCallback(processCallbacks, { timeout: IDLE_TIMEOUT });
  } else if (typeof self.requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      const startTime = Date.now();
      processCallbacks({
        timeRemaining: () => {
          return Math.max(0, DEFAULT_TIME_SLICE - (Date.now() - startTime));
        }
      });
    });
  } else {
    onTickEnd(() => {
      const startTime = Date.now();
      processCallbacks({
        timeRemaining: () => {
          return Math.max(0, DEFAULT_TIME_SLICE - (Date.now() - startTime));
        }
      });
    });
  }
}

export default function onIdle(callback: NoneToVoidFunction) {
  if (!onIdleCallbacks) {
    onIdleCallbacks = [callback];
    scheduleCallbacks();
  } else {
    onIdleCallbacks.push(callback);
  }
}
