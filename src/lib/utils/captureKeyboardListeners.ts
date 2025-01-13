type IHandlerName =
  | 'Enter'
  | 'Backspace'
  | 'Delete'
  | 'Esc'
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Right'
  | 'Tab'
  | 'Space';

type HandlerName = `on${IHandlerName}`;
type Handler = (e: KeyboardEvent) => void | boolean;
type CaptureOptions = Partial<Record<HandlerName, Handler>>;
type ReleaseListeners = () => void;

const keyToHandlerName: Record<string, HandlerName> = {
  Enter: 'onEnter',
  Backspace: 'onBackspace',
  Delete: 'onDelete',
  Esc: 'onEsc',
  Escape: 'onEsc',
  ArrowUp: 'onUp',
  ArrowDown: 'onDown',
  ArrowLeft: 'onLeft',
  ArrowRight: 'onRight',
  Tab: 'onTab',
  Space: 'onSpace',
};

// space: [effect1, effect2, ...]

const handlers: Record<HandlerName, Handler[]> = {
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

export default function captureKeyboardListeners(options: CaptureOptions): ReleaseListeners {
  if (!hasActiveHandlers()) {
    document.addEventListener('keydown', handleKeyDown, true);
  }

  const keysArray = Object.keys(options) as Array<HandlerName>;

  for (const handlerName of keysArray) {
    const handler = options[handlerName];
    if (!handler) {
      continue;
    }

    const currentEventHandlers = handlers[handlerName];
    if (currentEventHandlers) {
      currentEventHandlers.push(handler);
    }
  }

  return () => releaseKeyboardListener(options);
}

function hasActiveHandlers() {
  return Object.values(handlers).some(handlerArray => handlerArray.length > 0);
}

function handleKeyDown(e: KeyboardEvent) {
  const handlerName = keyToHandlerName[e.key];
  if (!handlerName) {
    return;
  }

  const currentEventHandlers = handlers[handlerName];
  const { length } = currentEventHandlers;

  if (!length) {
    return;
  }

  for (let i = length - 1; i >= 0; i--) {
    const handler = currentEventHandlers[i]!;

    if (handler(e) !== false) {
      e.stopPropagation();
      break;
    }
  }
}

function releaseKeyboardListener(options: CaptureOptions) {
  const keysArray = Object.keys(options) as Array<HandlerName>;

  for (const handlerName of keysArray) {
    const handler = options[handlerName];
    const currentEventHandlers = handlers[handlerName];

    if (currentEventHandlers) {
      const index = currentEventHandlers.findIndex(cb => cb === handler);

      if (index !== -1) {
        currentEventHandlers.splice(index, 1);
      }
    }
  }

  if (!hasActiveHandlers()) {
    document.removeEventListener('keydown', handleKeyDown, false);
  }
}

export type { IHandlerName, HandlerName, CaptureOptions, ReleaseListeners };
