/**
 * The constant defines the timeout for the fallback mechanism, which triggers after the specified duration
 * if `requestAnimationFrame` is not used.
 * @constant {number}
 */
const FAST_RAF_TIMEOUT_FALLBACK_MS = 35; // < 30 FPS

/**
 * A set of callback functions to be executed within the current frame via `requestAnimationFrame`.
 * @type {Set<NoneToVoidFunction> | undefined}
 */
let fastRafCallbacks: Set<NoneToVoidFunction> | undefined;

/**
 * A set of callback functions to be executed if the `requestAnimationFrame` does not trigger within the timeout.
 * @type {Set<NoneToVoidFunction> | undefined}
 */
let fastRafFallbackCallbacks: Set<NoneToVoidFunction> | undefined;

/**
 * Timeout ID used for the fallback timeout mechanism.
 * @type {number | undefined}
 */
let fastRafFallbackTimeout: number | undefined;

/**
 * Schedules a callback to be executed on the next frame via `requestAnimationFrame`. Optionally, a fallback can
 * be used if the frame does not occur within a specific timeout period.
 * Raf - Request Animation Frame
 * @param {NoneToVoidFunction} callback - The function to be called on the next animation frame.
 * @param {boolean} [withTimeoutFallback=false] - Whether to enable fallback execution after a timeout if `requestAnimationFrame` doesn't trigger.
 */
export default function fastRaf(
  callback: NoneToVoidFunction,
  withTimeoutFallback: boolean = false,
) {
  // May result in an immediate execution if called from another RAF callback which was scheduled
  // (and therefore is executed) earlier than RAF callback scheduled by `fastRaf`

  if (!fastRafCallbacks) {
    initializeFastRafCallbacks(callback);
  } else {
    fastRafCallbacks.add(callback);
  }

  if (withTimeoutFallback) {
    initializeTimeoutFallback(callback);
  }
}

/**
 * Initializes the `fastRafCallbacks` set and schedules the execution of the callbacks on the next frame.
 *
 * @param {NoneToVoidFunction} callback - The function to be added to the `fastRafCallbacks` set.
 */
function initializeFastRafCallbacks(callback: NoneToVoidFunction) {
  fastRafCallbacks = new Set([callback]);

  /**
   * Executes the callbacks in `fastRafCallbacks` once the next frame is ready.
   * Cleans up resources after execution.
   */
  requestAnimationFrame(() => {
    const currentCallbacks = fastRafCallbacks!;
    fastRafCallbacks = undefined;
    fastRafFallbackCallbacks = undefined;

    if (fastRafFallbackTimeout) {
      clearTimeout(fastRafFallbackTimeout);
      fastRafFallbackTimeout = undefined;
    }

    currentCallbacks.forEach((cb) => cb());
  });
}

/**
 * Initializes the fallback mechanism by adding the callback to the `fastRafFallbackCallbacks` set and setting up
 * a timeout to execute it if `requestAnimationFrame` doesn't trigger in time.
 *
 * @param {NoneToVoidFunction} callback - The function to be added to the `fastRafFallbackCallbacks` set.
 */
function initializeTimeoutFallback(callback: NoneToVoidFunction) {
  if (!fastRafFallbackCallbacks) {
    fastRafFallbackCallbacks = new Set([callback]);
  } else {
    fastRafFallbackCallbacks.add(callback);
  }

  if (!fastRafFallbackTimeout) {
    /**
     * Executes the fallback callbacks if `requestAnimationFrame` did not trigger in time.
     * Cleans up the fallback resources after execution.
     */
    fastRafFallbackTimeout = window.setTimeout(() => {
      const currentTimeoutCallbacks = fastRafFallbackCallbacks!;

      if (fastRafCallbacks) {
        currentTimeoutCallbacks.forEach(
          fastRafCallbacks.delete,
          fastRafCallbacks,
        );
      }

      fastRafFallbackCallbacks = undefined;

      if (fastRafFallbackTimeout) {
        clearTimeout(fastRafFallbackTimeout);
        fastRafFallbackTimeout = undefined;
      }

      currentTimeoutCallbacks.forEach((cb) => cb());
    }, FAST_RAF_TIMEOUT_FALLBACK_MS);
  }
}
