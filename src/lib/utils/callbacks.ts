export function createCallbackManager<
  T extends AnyToVoidFunction = AnyToVoidFunction,
>(): {
  addCallback: (callback: T) => () => void;
  removeCallback: (callback: T) => void;
  runCallbacks: (...args: Parameters<T>) => void;
  hasCallbacks: () => boolean;
  runCallbacksAsync: (...args: Parameters<T>) => void;
} {
  const callbacks = new Set<T>();

  const addCallback = (callback: T): (() => void) => {
    callbacks.add(callback);
    return () => removeCallback(callback);
  };

  const removeCallback = (callback: T): void => {
    callbacks.delete(callback);
  };

  const runCallbacks = (...args: Parameters<T>): void => {
    try {
      callbacks.forEach((callback) => callback(...args));
    } catch (e) {
      console.error("Error executing callback:", e);
    }
  };

  // when the callbacks might be time-consuming, and you don't want them to block the main execution thread.
  // This is how we work with a sequence of macro tasks
  const runCallbacksAsync = (...args: Parameters<T>): void => {
    setTimeout(() => {
      runCallbacks(...args);
    }, 0);
  };

  const hasCallbacks = () => callbacks.size > 0;

  return {
    addCallback,
    removeCallback,
    runCallbacks,
    hasCallbacks,
    runCallbacksAsync,
  };
}

export type CallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction> =
  ReturnType<typeof createCallbackManager<T>>;
