const FAST_RAF_TIMEOUT_FALLBACK_MS = 16.67; // 60 FPS target
const MAX_CALLBACKS_PER_FRAME = 1000; // Prevent callback queue overflow
const WARN_CALLBACKS_THRESHOLD = 100; // Warn if too many callbacks queue up

interface FastRafState {
  callbacks: Set<NoneToVoidFunction>;
  fallbackCallbacks: Set<NoneToVoidFunction>;
  fallbackTimeout: number | undefined;
  isScheduled: boolean;
  lastFrameTime: number;
  consecutiveTimeoutCount: number;
}

// Singleton state
const state: FastRafState = {
  callbacks: new Set(),
  fallbackCallbacks: new Set(),
  fallbackTimeout: undefined,
  isScheduled: false,
  lastFrameTime: 0,
  consecutiveTimeoutCount: 0,
};

function executeCallbacks(callbacks: Set<NoneToVoidFunction>, source: string) {
  const startTime = performance.now();

  try {
    if (callbacks.size > WARN_CALLBACKS_THRESHOLD) {
      console.warn(
        `Large number of callbacks (${callbacks.size}) in fastRaf from ${source}`,
      );
    }

    callbacks.forEach((cb) => {
      try {
        cb();
      } catch (error) {
        console.error(`Error in fastRaf callback from ${source}:`, error);
        // Don't let one callback failure stop others from executing
      }
    });

    const executionTime = performance.now() - startTime;
    if (executionTime > FAST_RAF_TIMEOUT_FALLBACK_MS) {
      console.warn(
        `Slow fastRaf execution from ${source}: ${executionTime.toFixed(2)}ms`,
      );
    }
  } finally {
    callbacks.clear(); // Ensure cleanup even if errors occur
  }
}

function scheduleFrame() {
  if (state.callbacks.size === 0 || state.isScheduled) {
    return;
  }

  state.isScheduled = true;
  const frameStartTime = performance.now();

  requestAnimationFrame(() => {
    state.isScheduled = false;
    const frameDuration = performance.now() - frameStartTime;

    // Check if we're consistently getting slow frames
    if (frameDuration > FAST_RAF_TIMEOUT_FALLBACK_MS) {
      state.consecutiveTimeoutCount++;
      if (state.consecutiveTimeoutCount > 5) {
        console.warn('Multiple slow frames detected in fastRaf');
      }
    } else {
      state.consecutiveTimeoutCount = 0;
    }

    state.lastFrameTime = performance.now();
    executeCallbacks(state.callbacks, 'RAF');
  });
}

/**
 * Schedule a callback to run on the next animation frame.
 * Callbacks are batched for performance.
 *
 * @param callback Function to execute on next frame
 * @param withTimeoutFallback Whether to use setTimeout as fallback
 * @throws If callback is not a function or too many callbacks are queued
 */
export default function fastRaf(
  callback: NoneToVoidFunction,
  withTimeoutFallback = false,
): void {
  if (typeof callback !== 'function') {
    throw new TypeError('fastRaf callback must be a function');
  }

  if (state.callbacks.size >= MAX_CALLBACKS_PER_FRAME) {
    throw new Error('Too many callbacks queued in fastRaf');
  }

  state.callbacks.add(callback);
  scheduleFrame();

  if (withTimeoutFallback) {
    // Only add fallback if RAF might be delayed
    const timeSinceLastFrame = performance.now() - state.lastFrameTime;
    if (timeSinceLastFrame > FAST_RAF_TIMEOUT_FALLBACK_MS) {
      state.fallbackCallbacks.add(callback);

      if (!state.fallbackTimeout) {
        state.fallbackTimeout = window.setTimeout(() => {
          const fallbackCallbacks = new Set(state.fallbackCallbacks);
          state.fallbackCallbacks.clear();
          state.fallbackTimeout = undefined;

          // Remove callbacks that will be handled by RAF
          state.callbacks.forEach((cb) => fallbackCallbacks.delete(cb));

          if (fallbackCallbacks.size > 0) {
            executeCallbacks(fallbackCallbacks, 'Timeout');
          }
        }, FAST_RAF_TIMEOUT_FALLBACK_MS);
      }
    }
  }
}

fastRaf.reset = function reset(): void {
  state.callbacks.clear();
  state.fallbackCallbacks.clear();
  if (state.fallbackTimeout) {
    clearTimeout(state.fallbackTimeout);
    state.fallbackTimeout = undefined;
  }
  state.isScheduled = false;
  state.consecutiveTimeoutCount = 0;
};

export const __testing_fastRaf = {
  state,
  executeCallbacks,
  scheduleFrame,
};
