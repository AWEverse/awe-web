const FAST_RAF_TIMEOUT_FALLBACK_MS = 35; // < 30 FPS

let fastRafCallbacks: Set<NoneToVoidFunction> | undefined;
let fastRafFallbackCallbacks: Set<NoneToVoidFunction> | undefined;
let fastRafFallbackTimeout: number | undefined;
let isScheduled = false;

// May result in an immediate execution if called from another RAF callback which was scheduled
// (and therefore is executed) earlier than RAF callback scheduled by `fastRaf`
export default function fastRaf(
  callback: NoneToVoidFunction,
  withTimeoutFallback = false,
) {
  if (!callback) {
    throw new Error("Callback is required");
  }

  if (!fastRafCallbacks) {
    fastRafCallbacks = new Set([callback]);
    isScheduled = true;

    requestAnimationFrame(() => {
      isScheduled = false;
      const currentCallbacks = fastRafCallbacks!;
      fastRafCallbacks = undefined;
      fastRafFallbackCallbacks = undefined;

      if (fastRafFallbackTimeout) {
        clearTimeout(fastRafFallbackTimeout);
        fastRafFallbackTimeout = undefined;
      }

      try {
        currentCallbacks.forEach((cb) => cb());
      } catch (error) {
        console.error("Error in fastRaf callback:", error);
      }
    });
  } else {
    fastRafCallbacks.add(callback);
  }

  if (withTimeoutFallback && !isScheduled) {
    if (!fastRafFallbackCallbacks) {
      fastRafFallbackCallbacks = new Set([callback]);
    } else {
      fastRafFallbackCallbacks.add(callback);
    }

    if (!fastRafFallbackTimeout) {
      fastRafFallbackTimeout = window.setTimeout(() => {
        const currentTimeoutCallbacks = fastRafFallbackCallbacks!;
        const mainCallbacks = fastRafCallbacks;

        if (mainCallbacks) {
          currentTimeoutCallbacks.forEach((cb) => mainCallbacks.delete(cb));
        }
        fastRafFallbackCallbacks = undefined;
        fastRafFallbackTimeout = undefined;

        try {
          currentTimeoutCallbacks.forEach((cb) => cb());
        } catch (error) {
          console.error("Error in fastRaf fallback callback:", error);
        }
      }, FAST_RAF_TIMEOUT_FALLBACK_MS);
    }
  }
}
