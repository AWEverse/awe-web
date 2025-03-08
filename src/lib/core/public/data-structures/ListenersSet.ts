type NoneToVoidFunction = () => void;

interface ListenerSet {
  add(listener: NoneToVoidFunction): void;
  delete(listener: NoneToVoidFunction): void;
  emit(): void;
  size(): number;
  clear(): void;
}

/**
 * Creates a new listener set for managing and invoking listener functions.
 * @returns A ListenerSet object with methods to manage listeners.
 */
const createListenersSet = (): ListenerSet => {
  const listeners = new Set<NoneToVoidFunction>();

  return {
    /**
     * Adds a listener function to the set.
     * @param listener The function to add.
     * @throws TypeError if the listener is not a function.
     */
    add(listener: NoneToVoidFunction): void {
      if (typeof listener !== "function") {
        throw new TypeError("Listener must be a function");
      }
      listeners.add(listener);
    },

    /**
     * Removes a listener function from the set.
     * @param listener The function to remove.
     */
    delete(listener: NoneToVoidFunction): void {
      if (typeof listener !== "function") {
        return; // Silently ignore non-functions for consistency
      }
      listeners.delete(listener);
    },

    /**
     * Invokes all listener functions in the set.
     * Errors are caught and logged to prevent one listener from breaking the chain.
     */
    emit(): void {
      listeners.forEach((listener) => {
        try {
          listener();
        } catch (error) {
          console.error("Listener execution failed:", error);
        }
      });
    },

    /**
     * Returns the number of listeners in the set.
     * @returns The current number of listeners.
     */
    size(): number {
      return listeners.size;
    },

    /**
     * Removes all listeners from the set.
     */
    clear(): void {
      listeners.clear();
    },
  };
};

export default createListenersSet;
