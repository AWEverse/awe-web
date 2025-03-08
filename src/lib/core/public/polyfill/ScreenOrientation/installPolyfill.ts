import detectScreenOrientation from "./detectScreenOrientation";
import { DelegateSearchResult, EventDelegate } from "./types";

interface PolyfillOrientation {
  type: string;
  onchange?: (evt: Event) => void;
}

const orientation: PolyfillOrientation | ScreenOrientation = detectScreenOrientation() || { type: "unknown" };

function initializeOrientation(): ScreenOrientation | PolyfillOrientation {
  const screen = window.screen;

  // Use W3C ScreenOrientation API if available.
  if (typeof window.ScreenOrientation === "function" && screen.orientation instanceof ScreenOrientation) {
    return screen.orientation;
  }

  (screen as any).orientation = orientation;
  return orientation;
}


function createOrientationChangeEvent(eventName: string, props?: EventInit): Event {
  try {
    return new Event(eventName, props);
  } catch (error) {
    // Fallback for older browsers.
    return { type: eventName } as Event;
  }
}

declare function getMediaQueryList(): MediaQueryList | undefined;

export function createCustomDelegate(
  orientationObject: PolyfillOrientation
): EventDelegate {
  const delegate: EventDelegate = {
    listeners: {},
    addEventListener(eventName: string, listener: EventListenerOrEventListenerObject): void {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      if (!this.listeners[eventName].includes(listener as (evt: Event) => void)) {
        this.listeners[eventName].push(listener as (evt: Event) => void);
      }
    },
    removeEventListener(eventName: string, listener: EventListenerOrEventListenerObject): void {
      const listeners = this.listeners[eventName];
      if (!listeners) return;

      const callbackIndex = listeners.indexOf(listener as (evt: Event) => void);
      if (callbackIndex > -1) {
        listeners.splice(callbackIndex, 1);
      }
    },
    dispatchEvent(event: Event): void {
      const listeners = this.listeners[event.type];
      if (!listeners) return;

      listeners.forEach(callback => callback(event));

      if (typeof orientationObject.onchange === "function") {
        orientationObject.onchange(event);
      }
    },
  };

  const mediaQueryList = getMediaQueryList();
  if (mediaQueryList && typeof mediaQueryList.matches === "boolean") {
    mediaQueryList.addListener(() => {
      delegate.dispatchEvent(createOrientationChangeEvent("change"));
    });
  }

  return delegate;
}


export function findOrientationDelegate(
  orientationObject: PolyfillOrientation
): DelegateSearchResult {
  const screen = window.screen;
  const possibleEvents = ["orientationchange", "mozorientationchange", "msorientationchange"];

  for (const event of possibleEvents) {
    if ((screen as any)["on" + event] === null) {
      return {
        delegate: screen as unknown as EventTarget,
        eventName: event,
      };
    }
  }

  if (typeof window.onorientationchange !== "undefined") {
    return {
      delegate: window,
      eventName: "orientationchange",
    };
  }

  return {
    delegate: createCustomDelegate(orientationObject),
    eventName: "change",
  };
}

export default {
  orientation,
  detectScreenOrientation,
  initializeOrientation,
};
