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
let pendingCallbackFunctions = new Set<NoneToVoidFunction>();

// Define the CallbackEntry type as a discriminated union based on hasFallback
type CallbackEntry = {
  id: number;
  callback: NoneToVoidFunction;
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

/**
 * Adds a callback to the pending list and schedules its execution.
 * @param callback - The function to execute.
 * @param hasFallback - Whether to include a timeout fallback.
 */
function addCallback(callback: NoneToVoidFunction, hasFallback: boolean) {
  // Prevent duplicate callbacks
  if (pendingCallbackFunctions.has(callback)) {
    return;
  }
  pendingCallbackFunctions.add(callback);

  const id = callbackIdCounter++;

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
    // Reschedule timeout if this fallback time is earlier than the current one
    if (nextTimeoutTime === undefined || fallbackTime < nextTimeoutTime) {
      nextTimeoutTime = fallbackTime;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      const delay = Math.max(0, nextTimeoutTime - Date.now());
      timeoutId = setTimeout(handleTimeout, delay);
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

/**
 * Handles timeout fallbacks by executing callbacks that have exceeded their delay
 * and rescheduling the next timeout if necessary.
 */
function handleTimeout() {
  const currentTime = Date.now();
  const len = pendingCallbacks.length;
  let minFallbackTime = Infinity;
  let writeIndex = 0;

  // Single pass to execute timed-out callbacks and compact the array
  for (let i = 0; i < len; ++i) {
    const entry = pendingCallbacks[i];

    if (entry.hasFallback && !entry.executed) {
      const fallbackTime = entry.additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS;
      if (fallbackTime <= currentTime) {
        try {
          entry.callback();
          entry.executed = true;
          pendingCallbackFunctions.delete(entry.callback);
        } catch (error) {
          if (DEBUG) console.error("Error in callback:", error);
        }
      } else {
        if (fallbackTime < minFallbackTime) {
          minFallbackTime = fallbackTime;
        }
        pendingCallbacks[writeIndex++] = entry;
      }
    } else if (!entry.executed) {
      pendingCallbacks[writeIndex++] = entry;
    }
  }

  pendingCallbacks.length = writeIndex;

  if (writeIndex > 0 && minFallbackTime < Infinity) {
    nextTimeoutTime = minFallbackTime;
    const delay = Math.max(0, nextTimeoutTime - currentTime);
    timeoutId = setTimeout(handleTimeout, delay);
  } else {
    nextTimeoutTime = undefined;
    timeoutId = undefined;
  }
}

/**
 * Executes all pending callbacks via requestAnimationFrame and cleans up.
 */
function executeAllCallbacks() {
  const len = pendingCallbacks.length;
  let writeIndex = 0;

  for (let i = 0; i < len; ++i) {
    const entry = pendingCallbacks[i];

    if (!entry.executed) {
      try {
        entry.callback();
        entry.executed = true;
        pendingCallbackFunctions.delete(entry.callback);
      } catch (error) {
        if (DEBUG) console.error("Error in callback:", error);
      }
    }

    if (!entry.executed) {
      pendingCallbacks[writeIndex++] = entry;
    }
  }

  pendingCallbacks.length = writeIndex;
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
  nextTimeoutTime = undefined;
  timeoutId = undefined;
}

/**
 * Schedules a callback to run on the next animation frame, with an optional timeout fallback.
 * @param callback - The function to execute.
 * @param withTimeoutFallback - If true, ensures execution within 35ms via a timeout.
 */
export default function fastRaf(
  callback: NoneToVoidFunction,
  withTimeoutFallback: boolean = false,
) {
  addCallback(callback, withTimeoutFallback);

  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      executeAllCallbacks();
      rafScheduled = false;
    });
  }
}
