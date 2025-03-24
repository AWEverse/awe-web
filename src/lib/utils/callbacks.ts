/**
 * Creates a manager for handling callbacks, allowing for adding, running, and removing callbacks.
 *
 * @template T - The type of the callback function, which can accept any arguments.
 * @returns An object with methods to add, run, and check callbacks.
 */
export const createCallbackManager = <T extends AnyToVoidFunction>() => {
  const callbacks = new Set<T>();

  return {
    /**
     * Adds a callback function to the callback set and returns a function to remove it.
     *
     * @param {T} cb - The callback function to be added.
     * @returns {NoneToVoidFunction} A function that, when called, removes the added callback.
     */
    addCallback: (cb: T): NoneToVoidFunction => {
      callbacks.add(cb);

      return () => {
        callbacks.delete(cb);
      };
    },

    /**
     * Executes all the callbacks in the set with the provided arguments.
     *
     * @param {...Parameters<T>} args - The arguments to pass to each callback function.
     */
    runCallbacks: (...args: Parameters<T>) => {
      for (const cb of callbacks) {
        cb(...args);
      }
    },
    /**
     * Checks if there are any callbacks present in the set.
     *
     * @returns {boolean} `true` if there are callbacks, `false` otherwise.
     */
    hasCallbacks: (): boolean => {
      return Boolean(callbacks.size);
    },
  };
};

/**
 * Represents the type of the callback manager created by `createCallbackManager`.
 *
 * @template T - The type of the callback function managed by the callback manager.
 */
export type CallbackManager<T extends AnyToVoidFunction> = ReturnType<
  typeof createCallbackManager<T>
>;
