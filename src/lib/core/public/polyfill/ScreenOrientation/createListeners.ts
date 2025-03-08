type Listener = ((evt: Event) => void) | { handleEvent(evt: Event): void };

const listenerMap: Map<Listener, Listener> = new Map();

function defineProperty<T, K extends keyof T>(obj: T, key: K, val: T[K]): void {
  Object.defineProperty(obj, key, {
    value: val,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

function createOrientationChangeEvent(name: string, props?: EventInit): Event {
  try {
    return new Event(name, props);
  } catch (e) {
    return { type: "change" } as Event; // Fallback for older browsers.
  }
}

function wrapListener(originalListener: Listener, target: EventTarget): Listener {
  if (listenerMap.has(originalListener)) {
    return listenerMap.get(originalListener)!;
  }

  const wrappedListener = (evt: Event): void => {
    defineProperty(evt, "target", target);
    defineProperty(evt, "currentTarget", target);
    defineProperty(evt, "type", "change");

    if (typeof originalListener === "function") {
      originalListener(evt);
    } else if (originalListener && typeof originalListener.handleEvent === "function") {
      originalListener.handleEvent(evt);
    }
  };

  listenerMap.set(originalListener, wrappedListener);
  return wrappedListener;
}

function removeListener(originalListener: Listener): void {
  listenerMap.delete(originalListener);
}

function delegateListener(
  fnName: "addEventListener" | "removeEventListener" | "dispatchEvent",
  context: { addEventListener(...args: any[]): any; removeEventListener(...args: any[]): any },
  eventName: string
) {
  return function delegatedHandler(this: any, ...args: any[]): any {
    const [eventArg, listener] = args;

    if (eventArg !== "change") return;

    const wrappedListener = wrapListener(listener, this as EventTarget);

    if (fnName === "addEventListener") {
      listenerMap.set(listener, wrappedListener);
    } else if (fnName === "removeEventListener") {
      removeListener(listener);
    } else {
      delegateListener(listener);
    }

    return context[fnName](eventName, wrappedListener);
  };
}

export {
  delegateListener as delegate,
  defineProperty as defineValue,
  createOrientationChangeEvent as getOrientationChangeEvent,
  wrapListener as wrapCallback,
  listenerMap as trackedListeners,
  removeListener as removeTrackedListener,
};
