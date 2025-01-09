export function createCallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction>(): {
  addCallback: (callback: T) => () => void;
  removeCallback: (callback: T) => void;
  runCallbacks: (...args: Parameters<T>) => void;
  hasCallbacks: () => boolean;
  runCallbacksAsync: (...args: Parameters<T>) => void;
} {
  const callbacks = new Set<T>();
  let hasCallbackFlag = false;

  const addCallback = (callback: T): (() => void) => {
    callbacks.add(callback);
    hasCallbackFlag = true;
    return () => removeCallback(callback);
  };

  const removeCallback = (callback: T): void => {
    if (callbacks.delete(callback)) {
      hasCallbackFlag = callbacks.size > 0;
    }
  };

  const runCallbacks = (...args: Parameters<T>): void => {
    callbacks.forEach(callback => callback(...args));
  };

  // when the callbacks might be time-consuming, and you don't want them to block the main execution thread.
  // This is how we work with a sequence of macro tasks
  const runCallbacksAsync = (...args: Parameters<T>): void => {
    setTimeout(() => {
      callbacks.forEach(callback => callback(...args));
    }, 0);
  };

  const hasCallbacks = () => hasCallbackFlag;

  return {
    addCallback,
    removeCallback,
    runCallbacks,
    hasCallbacks,
    runCallbacksAsync,
  };
}

export type CallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction> = ReturnType<
  typeof createCallbackManager<T>
>;
