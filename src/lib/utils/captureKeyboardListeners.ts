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

export type Rules = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export type CaptureOptions = {
  bindings: Partial<Record<HandlerName, Handler>>;
  rules?: Rules;
};

export type ReleaseListeners = () => void;

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

// Internal binding structure
interface Binding {
  handler: Handler;
  rules?: Rules;
}

export class KeyboardListenerManager {
  private handlers: { [K in HandlerName]: Binding[] } = {
    onEnter: [],
    onBackspace: [],
    onDelete: [],
    onEsc: [],
    onUp: [],
    onDown: [],
    onLeft: [],
    onRight: [],
    onTab: [],
    onSpace: [],
  };
  private activeHandlerCount = 0;
  private isListenerAttached = false;

  private handleKeyDown = (e: KeyboardEvent): void => {
    const handlerName = keyToHandlerName[e.key];
    if (!handlerName) return;

    const bindingList = this.handlers[handlerName];
    if (!bindingList.length) return;

    // Execute handlers in LIFO order
    for (let i = bindingList.length - 1; i >= 0; i--) {
      const { handler, rules } = bindingList[i];
      const result = handler(e);

      if (result !== false) {
        const { preventDefault = false, stopPropagation = true } = rules ?? {};
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        break;
      }
    }
  };

  capture(options: CaptureOptions): ReleaseListeners {
    const addedBindings: [HandlerName, Binding][] = [];
    const shouldAttachListener = this.activeHandlerCount === 0;

    for (const [key, handler] of Object.entries(options.bindings)) {
      const handlerName = key as HandlerName;

      if (typeof handler === 'function') {
        const binding: Binding = { handler, rules: options.rules };
        this.handlers[handlerName].push(binding);
        addedBindings.push([handlerName, binding]);
        this.activeHandlerCount++;
      }
    }

    if (shouldAttachListener && !this.isListenerAttached) {
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.isListenerAttached = true;
    }

    return () => {
      for (const [handlerName, binding] of addedBindings) {
        const handlerList = this.handlers[handlerName];
        const index = handlerList.indexOf(binding);
        if (index > -1) {
          handlerList.splice(index, 1);
          this.activeHandlerCount--;
        }
      }
      if (this.isListenerAttached && this.activeHandlerCount === 0) {
        document.removeEventListener("keydown", this.handleKeyDown, true);
        this.isListenerAttached = false;
      }
    };
  }

  destroy(): void {
    if (this.isListenerAttached) {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      this.isListenerAttached = false;
    }

    for (const key in this.handlers) {
      this.handlers[key as HandlerName].length = 0;
    }

    this.activeHandlerCount = 0;
  }
}

const keyboardListenerManager = new KeyboardListenerManager();
export default function captureKeyboardListeners(
  options: CaptureOptions
): ReleaseListeners {
  return keyboardListenerManager.capture(options);
}
