import { DEBUG } from "@/lib/config/dev";

// Constant for the timeout fallback duration in milliseconds
const FAST_RAF_TIMEOUT_FALLBACK_MS = 35;

// Counter for assigning unique IDs to callbacks
let callbackIdCounter = 0;

// Array to store pending callback entries
let pendingCallbacks: CallbackEntry[] = [];

// Time when the next timeout should fire, or undefined if none
let nextTimeoutTime: number | undefined;

// ID of the current timeout, assuming browser environment where setTimeout returns a number
let timeoutId: ReturnType<typeof setTimeout> | undefined;

// Flag to indicate if a requestAnimationFrame is scheduled
let rafScheduled = false;

// Set to track unique callback functions and prevent duplicates
let pendingCallbackFunctions = new Set<() => void>();

// Define the CallbackEntry type as a discriminated union based on hasFallback
type CallbackEntry = {
  id: number;
  callback: () => void;
  executed: boolean;
} & (
    | {
      hasFallback: false;
      additionTime: undefined;
    }
    | {
      hasFallback: true;
      additionTime: number;
    }
  );

function addCallback(callback: () => void, hasFallback: boolean): void {
  if (pendingCallbackFunctions.has(callback)) {
    return;
  }
  pendingCallbackFunctions.add(callback);

  const id = callbackIdCounter++;

  // Add the callback entry based on whether it has a fallback
  if (hasFallback) {
    const additionTime = Date.now();

    pendingCallbacks.push({
      id,
      callback,
      hasFallback: true,
      additionTime,
      executed: false,
    });
    const fallbackTime = additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS;

    if (nextTimeoutTime === undefined || fallbackTime < nextTimeoutTime) {
      nextTimeoutTime = fallbackTime;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      const delay = Math.max(0, nextTimeoutTime - Date.now());
      timeoutId = setTimeout(() => {
        handleTimeout();
      }, delay);
    }
  } else {
    pendingCallbacks.push({
      id,
      callback,
      hasFallback: false,
      additionTime: undefined,
      executed: false,
    });
  }
}

function handleTimeout(): void {
  const currentTime = Date.now();

  for (let i = 0, len = pendingCallbacks.length; i < len; ++i) {
    const entry = pendingCallbacks[i];

    if (
      entry.hasFallback &&
      entry.additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS <= currentTime &&
      !entry.executed
    ) {
      try {
        entry.callback();
      } catch (error) {
        if (DEBUG) console.error("Error in callback:", error);
      }
      entry.executed = true;
      pendingCallbackFunctions.delete(entry.callback);
    }
  }
  pendingCallbacks = pendingCallbacks.filter((entry) => !entry.executed);

  // Schedule the next timeout if there are still pending callbacks with fallbacks
  if (pendingCallbacks.length > 0) {
    let minFallbackTime = Infinity;
    for (let i = 0, len = pendingCallbacks.length; i < len; ++i) {
      const entry = pendingCallbacks[i];

      if (entry.hasFallback) {
        const fallbackTime = entry.additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS;

        if (fallbackTime < minFallbackTime) {
          minFallbackTime = fallbackTime;
        }
      }
    }
    if (minFallbackTime < Infinity) {
      nextTimeoutTime = minFallbackTime;

      const delay = Math.max(0, nextTimeoutTime - Date.now());

      timeoutId = setTimeout(() => {
        handleTimeout();
      }, delay);
    } else {
      nextTimeoutTime = undefined;
      timeoutId = undefined;
    }
  } else {
    nextTimeoutTime = undefined;
    timeoutId = undefined;
  }
}

function executeAllCallbacks(): void {
  for (let i = 0, len = pendingCallbacks.length; i < len; ++i) {
    const entry = pendingCallbacks[i];

    if (!entry.executed) {
      try {
        entry.callback();
      } catch (error) {
        if (DEBUG) console.error("Error in callback:", error);
      }
      entry.executed = true;
      pendingCallbackFunctions.delete(entry.callback);
    }
  }

  pendingCallbacks = pendingCallbacks.filter((entry) => !entry.executed);

  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
  nextTimeoutTime = undefined;
  timeoutId = undefined;
}

export default function fastRaf(
  callback: () => void,
  withTimeoutFallback: boolean = false,
): void {
  addCallback(callback, withTimeoutFallback);

  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      executeAllCallbacks();
      rafScheduled = false;
    });
  }
}
