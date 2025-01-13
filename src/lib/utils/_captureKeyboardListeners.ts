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

const handlersWeakMap: WeakMap<EventTarget, Handler[]> = new WeakMap();

function addHandlerWeak(target: EventTarget, handler: Handler) {
  const currentHandlers = handlersWeakMap.get(target) || [];
  currentHandlers.push(handler);
  handlersWeakMap.set(target, currentHandlers);
}

function removeHandlerWeak(target: EventTarget, handler: Handler) {
  const currentHandlers = handlersWeakMap.get(target);
  if (!currentHandlers) return;

  const index = currentHandlers.indexOf(handler);
  if (index !== -1) {
    currentHandlers.splice(index, 1);
  }
}
