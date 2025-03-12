import onTickEnd from "./onTickEnd";

const IDLE_TIMEOUT = 500;

let onIdleCallbacks: NoneToVoidFunction[] | undefined;

function processCallbacks(deadline: IdleDeadline) {
  const currentCallbacks = onIdleCallbacks;
  onIdleCallbacks = undefined;

  if (!currentCallbacks) return;

  while (currentCallbacks.length > 0 && deadline.timeRemaining() > 0) {
    currentCallbacks.shift()!?.();
  }

  if (currentCallbacks.length > 0) {
    onIdleCallbacks = currentCallbacks;
    requestIdleCallback(processCallbacks, { timeout: IDLE_TIMEOUT });
  }
}

export default function onIdle(callback: NoneToVoidFunction) {
  if (!self.requestIdleCallback) {
    onTickEnd(callback);
    return;
  }

  if (!onIdleCallbacks) {
    onIdleCallbacks = [callback];
    requestIdleCallback(processCallbacks, { timeout: IDLE_TIMEOUT });
  } else {
    onIdleCallbacks.push(callback);
  }
}
