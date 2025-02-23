export type HandlerName =
  | "onEnter"
  | "onBackspace"
  | "onDelete"
  | "onEsc"
  | "onUp"
  | "onDown"
  | "onLeft"
  | "onRight"
  | "onTab"
  | "onSpace";

export type Handler = (e: KeyboardEvent) => void | boolean;

/**
 * Interface for optional rules that can be applied after a handler is executed.
 * - `preventDefault`: If set to true, calls `e.preventDefault()` on the event.
 * - `stopPropagation`: If set to true (default behavior), calls `e.stopPropagation()` on the event.
 */
export type Rules = {
  /** If true, calls e.preventDefault() after the handler is executed. */
  preventDefault?: boolean;
  /** If true, calls e.stopPropagation() after the handler is executed (defaults to true if not specified). */
  stopPropagation?: boolean;
};

/**
 * Options for capturing keyboard events.
 * - `bindings`: Object mapping HandlerNames to their corresponding Handler functions.
 * - `rules`: Optional global rules that will be applied to all provided bindings.
 */
export type CaptureOptions = {
  /** Object mapping keys (HandlerName) to their respective handler functions. */
  bindings: Partial<Record<HandlerName, Handler>>;
  /** Optional rules applied to each binding. */
  rules?: Rules;
};

export type ReleaseListeners = () => void;

/**
 * Mapping of native KeyboardEvent key values to our internal HandlerName.
 * For example, a key event with key "Enter" is mapped to "onEnter".
 */
const keyToHandlerName: Record<string, HandlerName> = {
  Enter: "onEnter",
  Backspace: "onBackspace",
  Delete: "onDelete",
  Esc: "onEsc",
  Escape: "onEsc",
  ArrowUp: "onUp",
  ArrowDown: "onDown",
  ArrowLeft: "onLeft",
  ArrowRight: "onRight",
  Tab: "onTab",
  " ": "onSpace",
};

/**
 * Internal interface representing a binding of a handler function along with its associated rules.
 */
interface Binding {
  handler: Handler;
  rules?: Rules;
}

/**
 * KeyboardListenerManager class is responsible for registering and managing keyboard event handlers.
 *
 * It maintains a map of HandlerName to an array of bindings (handler + rules). The class attaches a
 * single global keydown listener when there is at least one active handler, and removes it when no
 * handlers remain.
 */
export class KeyboardListenerManager {
  // Map from each HandlerName to an array of bindings.
  private handlers: Map<HandlerName, Binding[]> = new Map();
  // Count of active handlers across all keys.
  private activeHandlerCount = 0;
  // Flag indicating whether the global keydown event listener is attached.
  private isListenerAttached = false;

  constructor() {
    Object.values(keyToHandlerName).forEach((name) => this.handlers.set(name, []));
  }

  /**
   * Global keydown event handler. It identifies the corresponding HandlerName for the pressed key,
   * then iterates over the associated bindings in reverse order (LIFO) and executes them.
   * If a handler returns a value other than false, the configured rules (preventDefault and stopPropagation)
   * are applied and the loop breaks.
   *
   * @param e - The KeyboardEvent triggered by a key press.
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const handlerName = keyToHandlerName[e.key];
    if (!handlerName) return;

    const bindingList = this.handlers.get(handlerName);
    if (!bindingList || bindingList.length === 0) return;

    for (let i = bindingList.length - 1; i >= 0; i--) {
      const binding = bindingList[i];
      const result = binding.handler(e);
      if (result !== false) {
        const { preventDefault = false, stopPropagation = true } = binding.rules ?? {};
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        break;
      }
    }
  };

  /**
   * Registers keyboard event handlers as specified in the CaptureOptions.
   * If this is the first handler, the global keydown event listener is attached.
   *
   * @param options - CaptureOptions including the bindings (handlers) and optional rules.
   * @returns A cleanup function (ReleaseListeners) that, when called, removes only the handlers added during this capture.
   */
  capture(options: CaptureOptions): ReleaseListeners {
    const addedBindings: Array<{ handlerName: HandlerName; binding: Binding }> = [];
    const shouldAttachListener = this.activeHandlerCount === 0;

    for (const [key, boundHandler] of Object.entries(options.bindings)) {
      const handlerName = key as HandlerName;

      if (boundHandler && this.handlers.has(handlerName)) {
        const binding: Binding = { handler: boundHandler, rules: options.rules };

        this.handlers.get(handlerName)!.push(binding);
        addedBindings.push({ handlerName, binding });

        this.activeHandlerCount++;
      }
    }

    if (shouldAttachListener && !this.isListenerAttached) {
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.isListenerAttached = true;
    }

    return (): void => {
      addedBindings.forEach(({ handlerName, binding }) => {
        const handlerList = this.handlers.get(handlerName);

        if (!handlerList) return;

        const index = handlerList.indexOf(binding);

        if (index > -1) {
          handlerList.splice(index, 1);
          this.activeHandlerCount--;
        }
      });

      if (this.isListenerAttached && this.activeHandlerCount === 0) {
        document.removeEventListener("keydown", this.handleKeyDown, true);
        this.isListenerAttached = false;
      }
    };
  }

  /**
   * Completely destroys the KeyboardListenerManager by removing the global keydown listener
   * and clearing all registered handlers. This is useful for final cleanup when the manager is
   * no longer needed.
   */
  destroy(): void {
    if (this.isListenerAttached) {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      this.isListenerAttached = false;
    }
    this.handlers.forEach((bindingList) => (bindingList.length = 0));
    this.activeHandlerCount = 0;
  }
}

// Singleton instance of KeyboardListenerManager for use by the default export.
const keyboardListenerManager = new KeyboardListenerManager();

/**
 * Default function to capture keyboard listeners.
 *
 * A thin wrapper around the KeyboardListenerManager.capture method. It allows clients to register
 * key-specific handlers with optional rules and returns a cleanup function to unregister those handlers.
 *
 * @param options - The CaptureOptions specifying the bindings and rules.
 * @returns A ReleaseListeners function that removes the captured handlers when invoked.
 */
export default function captureKeyboardListeners(
  options: CaptureOptions
): ReleaseListeners {
  return keyboardListenerManager.capture(options);
}


/**
 * @fileoverview
 * A utility for managing keyboard event listeners in a controlled, stack-based (LIFO) manner.
 *
 * This module exports a KeyboardListenerManager class that allows capturing keyboard events
 * for specified keys. Handlers can be registered with optional rules (such as preventDefault
 * and stopPropagation), and the most recently added handler for a key takes precedence.
 * A global keydown listener is attached when at least one handler is active, and it is
 * automatically detached when no handlers remain.
 *
 * ### Types and Interfaces
 *
 * - **HandlerName**: A literal type representing the supported keyboard events (e.g., "onEnter", "onBackspace", etc.).
 * - **Handler**: A function that is called when a keyboard event occurs. It receives a KeyboardEvent object
 *   and returns either void or a boolean. A return value of `false` will prevent applying the default rules.
 * - **Rules**: An interface for optional rules that can be applied after a handler is executed.
 *   - `preventDefault`: If set to true, calls `e.preventDefault()` on the event.
 *   - `stopPropagation`: If set to true (default behavior), calls `e.stopPropagation()` on the event.
 * - **CaptureOptions**: Options for capturing keyboard events. It consists of:
 *   - `bindings`: An object mapping HandlerNames to their corresponding Handler functions.
 *   - `rules`: Optional global rules that will be applied to all provided bindings.
 * - **ReleaseListeners**: A type for the cleanup function returned by a capture call. When invoked,
 *   it removes the specific listeners added during that capture.
 *
 * ### Implementation Details
 *
 * The module defines a mapping from native KeyboardEvent key values (e.g., "Enter", "ArrowUp") to
 * the corresponding HandlerName. The KeyboardListenerManager maintains a Map of HandlerName to an array
 * of bindings (each binding encapsulates a handler and its associated rules). The class uses a global
 * keydown event listener which, upon a key event:
 *   - Determines the appropriate HandlerName using the `keyToHandlerName` map.
 *   - Iterates over the array of bindings in reverse order (LIFO) so that the most recently registered
 *     handler is executed first.
 *   - Executes the handler and, if the return value is not `false`, applies the provided rules
 *     (defaulting to calling `stopPropagation()` if no rules are specified).
 *
 * The `capture` method adds new handlers and attaches the global listener if necessary. It returns
 * a cleanup function that removes only the bindings added by that particular capture call. The
 * `destroy` method completely cleans up by removing the global listener and clearing all registered handlers.
 *
 * A default export function `captureKeyboardListeners` is provided as a thin wrapper around the manager.
 */
