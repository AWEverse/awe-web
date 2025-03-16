/**
 * Enhanced batch update mechanism with transaction support and error handling
 */
let batchDepth = 0;
const pendingUpdates = new Map<string, () => void>();
let batchErrorHandler: ((err: Error) => void) | null = null;

/**
 * Improved batch function with error handling and transaction support
 */
export function batch<T>(callback: () => T, errorHandler?: (err: Error) => void): T {
  if (typeof callback !== 'function') {
    throw new Error('[Signals] batch requires a function argument');
  }

  const previousErrorHandler = batchErrorHandler;
  if (errorHandler) batchErrorHandler = errorHandler;

  batchDepth++;
  try {
    return callback();
  } catch (err) {
    if (batchErrorHandler) {
      batchErrorHandler(err instanceof Error ? err : new Error(String(err)));
      return undefined as unknown as T;
    }
    throw err;
  } finally {
    batchDepth--;
    batchErrorHandler = previousErrorHandler;

    // Process all pending updates when exiting the outermost batch
    if (batchDepth === 0 && pendingUpdates.size > 0) {
      const updates = Array.from(pendingUpdates.values());
      pendingUpdates.clear();

      // Execute all updates with error handling
      updates.forEach(update => {
        try {
          update();
        } catch (err) {
          console.error('[Signals] Error in batched update:', err);
        }
      });
    }
  }
}
