const FAST_RAF_TIMEOUT_FALLBACK_MS = 35; // < 30 FPS

let fastRafCallbacks: Set<NoneToVoidFunction> | null;
let fastRafFallbackCallbacks: Set<NoneToVoidFunction> | null;
let fastRafFallbackTimeout: number | null;

/**
 * Schedules a callback to be executed on the next frame via requestAnimationFrame.
 * Optionally enables a fallback if the frame isn’t triggered within a specified timeout.
 */
export default function fastRaf(
  callback: NoneToVoidFunction,
  withTimeoutFallback: boolean = false,
): void {
  if (!fastRafCallbacks) {
    initFastRafCallbacks(callback);
  } else {
    fastRafCallbacks.add(callback);
  }

  if (withTimeoutFallback) {
    initTimeoutFallback(callback);
  }
}

/**
 * Initializes the fastRafCallbacks set and schedules execution on the next frame.
 */
function initFastRafCallbacks(callback: NoneToVoidFunction): void {
  fastRafCallbacks = new Set([callback]);

  requestAnimationFrame(() => {
    const callbacks = fastRafCallbacks;
    // Clean up global state for both primary and fallback mechanisms.
    fastRafCallbacks = null;
    fastRafFallbackCallbacks = null;

    if (fastRafFallbackTimeout !== null) {
      clearTimeout(fastRafFallbackTimeout);
      fastRafFallbackTimeout = null;
    }

    // Execute all scheduled callbacks.
    callbacks?.forEach((cb) => cb());
  });
}

/**
 * Initializes the fallback mechanism by adding the callback to the fallback set
 * and scheduling a timeout to execute them if requestAnimationFrame doesn’t trigger.
 */
function initTimeoutFallback(callback: NoneToVoidFunction): void {
  if (!fastRafFallbackCallbacks) {
    fastRafFallbackCallbacks = new Set();
  }
  fastRafFallbackCallbacks.add(callback);

  if (fastRafFallbackTimeout === null) {
    fastRafFallbackTimeout = window.setTimeout(() => {
      // If the RAF hasn’t fired, remove fallback callbacks from the main set to avoid duplicates.
      if (fastRafCallbacks && fastRafFallbackCallbacks) {
        const fallbackKeys = fastRafFallbackCallbacks.keys();
        let nextKey = fallbackKeys.next();

        while (!nextKey.done) {
          fastRafCallbacks.delete(nextKey.value);
          nextKey = fallbackKeys.next();
        }
      }

      const fallbackCallbacks = fastRafFallbackCallbacks;

      // Clean up fallback state.
      fastRafFallbackCallbacks = null;
      if (fastRafFallbackTimeout !== null) {
        clearTimeout(fastRafFallbackTimeout);
        fastRafFallbackTimeout = null;
      }

      // Execute all fallback callbacks.
      fallbackCallbacks?.forEach((cb) => cb());
    }, FAST_RAF_TIMEOUT_FALLBACK_MS);
  }
}
