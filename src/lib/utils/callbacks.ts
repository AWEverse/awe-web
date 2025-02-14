export function createCallbackManager<
  T extends AnyToVoidFunction = AnyToVoidFunction,
>(): {
  addCallback: (callback: T) => () => void;
  removeCallback: (callback: T) => void;
  runCallbacks: (...args: Parameters<T>) => void;
  hasCallbacks: () => boolean;
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

  const hasCallbacks = () => callbacks.size > 0;

  return {
    addCallback,
    removeCallback,
    runCallbacks,
    hasCallbacks,
  };
}

export type CallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction> =
  ReturnType<typeof createCallbackManager<T>>;
