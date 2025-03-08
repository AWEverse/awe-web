import { onIdleComplete } from "../animation";
import { EKeyboardKey } from "../os";

// Define the type for user-provided handlers
export type KeyHandlerPair = {
  [key in EKeyboardKey]?: (e: KeyboardEvent) => void;
};

// Internal state type with metadata
type SystemKeyHandlerPair = {
  [key in EKeyboardKey]?: (e: KeyboardEvent) => void;
} & {
  _globalVersion: number;
  _lastRequest: number;
};

let state: SystemKeyHandlerPair = {
  _globalVersion: 0,
  _lastRequest: Date.now(),
};

let isInitialized = false;

/**
 * Global keydown handler.
 * Executes the handler for the pressed key if it exists.
 */
function globalKeyHandler(e: KeyboardEvent): void {
  const key = e.key as EKeyboardKey;
  const handler = state[key];

  if (handler) {
    try {
      handler(e);
    } catch (error) {
      console.error(`Error in handler for key "${key}":`, error);
    }
  }
}

/**
 * Initializes the global keyboard listener in the capture phase.
 */
function initializeKeyboardListeners(): void {
  if (!isInitialized) {
    window.addEventListener("keydown", globalKeyHandler, true);
    isInitialized = true;
  }
}

/**
 * Disposes the global keyboard listener.
 */
function disposeKeyboardListeners(): void {
  if (isInitialized) {
    window.removeEventListener("keydown", globalKeyHandler, true);
    isInitialized = false;
  }
}

/**
 * Adds a handler for a specific key and updates metadata.
 * @param key The key to register.
 * @param handler The event handler to execute.
 */
function addKeyHandler(key: EKeyboardKey, handler: (e: KeyboardEvent) => void): void {
  if (!key.startsWith("_")) {
    state[key] = handler;
    updateMeta();
  }
}

/**
 * Adds multiple handlers in a batch, skipping reserved keys.
 * @param handlers An object mapping keys to handlers.
 */
function addKeyHandlers(handlers: KeyHandlerPair): void {
  let notSkipped = false;

  for (const key in handlers) {
    if (!key.startsWith("_")) {
      state[key as EKeyboardKey] = handlers[key as EKeyboardKey];
      notSkipped = true;
    }
  }

  if (notSkipped) {
    updateMeta();
  }
}

/**
 * Removes the handler for a specific key if it exists and updates metadata.
 * @param key The key whose handler should be removed.
 */
function removeKeyHandler(key: EKeyboardKey): void {
  if (state[key]) {
    onIdleComplete(() => {
      delete state[key];
    })

    updateMeta();
  }
}

/**
 * Removes handlers for multiple keys in a batch, updating metadata if any were removed.
 * @param keys An array of keys to remove.
 */
function removeKeyHandlers(keys: EKeyboardKey[]): void {
  let removed = false;

  onIdleComplete(() => {
    keys.forEach((key) => {
      if (state[key]) {
        delete state[key];
        removed = true;
      }
    });
  })

  if (removed) {
    updateMeta();
  }
}

/**
 * Returns an immutable snapshot of the current handlers, excluding metadata.
 */
function getState(): Readonly<KeyHandlerPair> {
  const handlers: KeyHandlerPair = {};
  for (const key in state) {
    if (!key.startsWith("_")) {
      handlers[key as EKeyboardKey] = state[key as EKeyboardKey];
    }
  }
  return Object.freeze(handlers);
}

/**
 * Returns the current global version of the state.
 * Useful for checking if the state has changed since the last check.
 */
function getGlobalVersion(): number {
  return state._globalVersion;
}

/**
 * Updates the global version and last request timestamp.
 * Called when the state changes (e.g., handlers added/removed).
 */
function updateMeta(): void {
  state._lastRequest = Date.now();
  state._globalVersion++;
}

disposeKeyboardListeners();
initializeKeyboardListeners();

export default {
  addKeyHandler,
  addKeyHandlers,
  removeKeyHandler,
  removeKeyHandlers,
  getState,
  getGlobalVersion,
};
