type IHandlerName =
  | "Enter"
  | "Backspace"
  | "Delete"
  | "Esc"
  | "Up"
  | "Down"
  | "Left"
  | "Right"
  | "Tab"
  | "Space";

type HandlerName = `on${IHandlerName}`;
type Handler = (e: KeyboardEvent) => void | boolean;
type CaptureOptions = Partial<Record<HandlerName, Handler>>;
type ReleaseListeners = () => void;

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
  " ": "onSpace", // Corrected space key mapping
};

// Initialize handlers dynamically
const handlerNames = [
  ...new Set(Object.values(keyToHandlerName)),
] as HandlerName[];

const handlers = handlerNames.reduce(
  (acc, name) => {
    acc[name] = [];
    return acc;
  },
  {} as Record<HandlerName, Handler[]>,
);

let activeHandlerCount = 0;

function hasActiveHandlers() {
  return activeHandlerCount > 0;
}

function handleKeyDown(e: KeyboardEvent) {
  const handlerName = keyToHandlerName[e.key];
  if (!handlerName) return;

  const handlersToCall = handlers[handlerName];
  if (!handlersToCall?.length) return;

  // Iterate from last added to first
  for (let i = handlersToCall.length - 1; i >= 0; i--) {
    const handler = handlersToCall[i];
    if (handler?.(e) !== false) {
      e.stopPropagation();
      break;
    }
  }
}

export default function captureKeyboardListeners(
  options: CaptureOptions,
): ReleaseListeners {
  const addedHandlers: Array<{ handlerName: HandlerName; handler: Handler }> =
    [];
  const shouldAttachListener = !hasActiveHandlers();

  Object.entries(options).forEach(([key, handler]) => {
    const handlerName = key as HandlerName;
    if (handler && handlers[handlerName]) {
      handlers[handlerName].push(handler);
      addedHandlers.push({ handlerName, handler });
      activeHandlerCount++;
    }
  });

  if (shouldAttachListener) {
    document.addEventListener("keydown", handleKeyDown, true);
  }

  return () => {
    addedHandlers.forEach(({ handlerName, handler }) => {
      const handlerList = handlers[handlerName];
      const index = handlerList.indexOf(handler);
      if (index > -1) {
        handlerList.splice(index, 1);
        activeHandlerCount--;
      }
    });

    if (shouldAttachListener && !hasActiveHandlers()) {
      document.removeEventListener("keydown", handleKeyDown, true);
    }
  };
}

export type { IHandlerName, HandlerName, CaptureOptions, ReleaseListeners };
