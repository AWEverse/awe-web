/** Timeout fallback duration in milliseconds (< 30 FPS) */
const FAST_RAF_TIMEOUT_FALLBACK_MS = 35;

/** Map to store callbacks and their associated timeout IDs */
let callbacks = new Map<() => void, { timeoutId?: number }>();
/** Flag to track if RAF is scheduled */
let rafScheduled = false;

/**
 * Schedules a callback to execute on the next animation frame.
 * Optionally adds a fallback timeout if the frame doesn’t trigger within 35ms.
 * @param callback - The function to execute
 * @param withTimeoutFallback - Whether to enable the timeout fallback (default: false)
 */
export default function fastRaf(
  callback: () => void,
  withTimeoutFallback: boolean = false,
): void {
  // Skip if callback is already scheduled
  if (callbacks.has(callback)) return;

  // Add callback to the map
  callbacks.set(callback, {});

  // Set up individual fallback timeout if requested
  if (withTimeoutFallback) {
    const timeoutId = window.setTimeout(() => {
      executeCallback(callback);
    }, FAST_RAF_TIMEOUT_FALLBACK_MS);
    callbacks.get(callback)!.timeoutId = timeoutId;
  }

  // Schedule RAF if not already scheduled
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      executeAllCallbacks();
      rafScheduled = false;
    });
  }
}

/**
 * Executes a specific callback and cleans up its state.
 * @param callback - The function to execute
 */
function executeCallback(callback: () => void): void {
  if (!callbacks.has(callback)) return;

  const { timeoutId } = callbacks.get(callback)!;
  if (timeoutId !== undefined) clearTimeout(timeoutId);
  callbacks.delete(callback);
  callback();
}

/**
 * Executes all scheduled callbacks and cleans up their state.
 */
function executeAllCallbacks(): void {
  // Copy callbacks to avoid issues if new ones are added during execution
  const currentCallbacks = new Map(callbacks);
  callbacks.clear();
  currentCallbacks.forEach(({ timeoutId }, callback) => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    callback();
  });
}
