export type Handler = (e: KeyboardEvent) => void | boolean;

export type Rules = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export type Binding = {
  key: string;
  handler: Handler;
  condition?: (e: KeyboardEvent) => boolean;
  rules?: Rules;
  priority?: number;
};

export type CaptureOptions = {
  bindings: Binding[];
};

export type LegacyCaptureOptions = {
  bindings: Partial<Record<HandlerName, Handler>>;
  rules?: Rules;
};

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

export type ReleaseListeners = () => void;

const handlerNameToKey: Record<HandlerName, string> = {
  onEnter: "Enter",
  onBackspace: "Backspace",
  onDelete: "Delete",
  onEsc: "Escape",
  onUp: "ArrowUp",
  onDown: "ArrowDown",
  onLeft: "ArrowLeft",
  onRight: "ArrowRight",
  onTab: "Tab",
  onSpace: " ",
};

export class KeyboardListenerManager {
  private handlers: { [key: string]: Binding[] } = {};
  private activeHandlerCount = 0;
  private isListenerAttached = false;

  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key;
    const bindingList = this.handlers[key];
    if (!bindingList || bindingList.length === 0) return;

    for (const binding of bindingList) {
      try {
        if (!binding.condition || binding.condition(e)) {
          const result = binding.handler(e);
          if (result !== false) {
            const { preventDefault = false, stopPropagation = true } =
              binding.rules ?? {};
            if (preventDefault) e.preventDefault();
            if (stopPropagation) e.stopPropagation();
            break;
          }
        }
      } catch (error) {
        console.error(`Error in keyboard handler for key "${key}":`, error);
        // Continue to the next handler
      }
    }
  };

  capture(options: CaptureOptions): ReleaseListeners {
    const addedBindings: [string, Binding][] = [];

    for (const binding of options.bindings) {
      const { key } = binding;
      if (!this.handlers[key]) {
        this.handlers[key] = [];
      }
      this.handlers[key].push(binding);
      addedBindings.push([key, binding]);
      this.activeHandlerCount++;
    }

    // Sort handlers for each modified key by priority (descending)
    const modifiedKeys = new Set(addedBindings.map(([key]) => key));
    for (const key of modifiedKeys) {
      this.handlers[key].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }

    if (this.activeHandlerCount > 0 && !this.isListenerAttached) {
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.isListenerAttached = true;
    }

    return () => {
      for (const [key, binding] of addedBindings) {
        const handlerList = this.handlers[key];
        if (handlerList) {
          const index = handlerList.indexOf(binding);
          if (index > -1) {
            handlerList.splice(index, 1);
            this.activeHandlerCount--;
          }
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
    this.handlers = {};
    this.activeHandlerCount = 0;
  }
}

const keyboardListenerManager = new KeyboardListenerManager();

export default function captureKeyboardListeners(
  options: CaptureOptions | LegacyCaptureOptions
): ReleaseListeners {
  return keyboardListenerManager.capture({
    bindings: (() => {
      if (Array.isArray(options.bindings)) {
        return options.bindings;
      } else {
        const legacyBindings = options.bindings as Partial<
          Record<HandlerName, Handler>
        >;
        return Object.entries(legacyBindings).map(([handlerName, handler]) => {
          const key = handlerNameToKey[handlerName as HandlerName];

          if (!key) {
            throw new Error(`Unknown handler name: ${handlerName}`);
          }
          return {
            key,
            handler,
            rules: (options as LegacyCaptureOptions).rules,
          };
        });
      }
    })(),
  });
}
