import createLandscapeOrientaion from "./createLandscapeOrientaion";
import { delegate, wrapCallback } from "./createListeners";
import { createOrientationLock } from "./createOrientationLock";
import { createUnlockOrientation } from "./createUnlockOrientation";
import { findOrientationDelegate, } from "./installPolyfill";
import { IScreenOrientation, ExtendedScreen } from "./types";


// Create a class that implements the interface.
// Note: The implementations for event methods and lock/unlock will be added via delegation.
class PScreenOrientation implements IScreenOrientation {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void = () => { };
  dispatchEvent: (event: Event) => boolean = () => true;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => void = () => { };

  lock!: (orientation: string) => Promise<void>;
  unlock!: () => void;

  onchange: ((this: ScreenOrientation, ev: Event) => any) | null = null;

  constructor() { }

  get type(): string {
    return "";
  }

  get angle(): number {
    return 0;
  }
}

export function createOrientation(): IScreenOrientation {
  const orientationMap: Record<string, string> = {
    "90": "landscape-primary",
    "-90": "landscape-secondary",
    "0": "portrait-primary",
    "180": "portrait-secondary",
  };

  const or = new PScreenOrientation();
  const found = findOrientationDelegate(or);

  PScreenOrientation.prototype.addEventListener = delegate(
    "addEventListener",
    found.delegate,
    found.eventName,
  );

  PScreenOrientation.prototype.dispatchEvent = delegate(
    "dispatchEvent",
    found.delegate,
    found.eventName,
  );

  PScreenOrientation.prototype.removeEventListener = delegate(
    "removeEventListener",
    found.delegate,
    found.eventName,
  );

  PScreenOrientation.prototype.lock = createOrientationLock();
  PScreenOrientation.prototype.unlock = createUnlockOrientation();

  Object.defineProperties(or, {
    onchange: {
      get() {
        return found.delegate["on" + found.eventName] || null;
      },
      set(cb: any) {
        found.delegate["on" + found.eventName] = wrapCallback(cb, or);
      },
      configurable: true,
      enumerable: true,
    },
    type: {
      get() {
        const scr: ExtendedScreen = window.screen as ExtendedScreen;

        return (
          scr.orientation ||
          scr.msOrientation ||
          scr.mozOrientation ||
          // @deprecated
          orientationMap[String(window.orientation)] ||
          (createLandscapeOrientaion().matches ? "landscape-primary" : "portrait-primary")
        );
      },
      configurable: true,
      enumerable: true,
    },
    angle: {
      value: 0,
      writable: false,
      configurable: true,
      enumerable: true,
    },
  });

  return or;
}
