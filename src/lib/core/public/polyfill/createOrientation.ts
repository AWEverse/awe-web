import createMatchMediaPolyfillIfNeeded from "./window/matchMediaPolyfill";

interface DelegateFound {
  delegate: any;
  event: string;
}

declare function findDelegate(obj: any): DelegateFound;
declare function delegate(method: string, delegateObj: any, event: string): any;
declare function getLock(): (orientation: string) => Promise<void>;
declare function getUnlock(): () => void;

function getMql(): MediaQueryList {
  createMatchMediaPolyfillIfNeeded();

  return window.matchMedia('(orientation: landscape)');
}
declare function wrapCallback(cb: any, or: any): any;

export interface IScreenOrientation extends ScreenOrientation {
  lock: (orientation: string) => Promise<void>;
}

interface ExtendedScreen extends Screen {
  msOrientation?: string;
  mozOrientation?: string;
}

// Create a class that implements the interface.
// Note: The implementations for event methods and lock/unlock will be added via delegation.
class ScreenOrientation implements IScreenOrientation {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void = () => { };
  dispatchEvent: (event: Event) => boolean = () => false;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => void = () => { };

  lock!: (orientation: string) => Promise<void>;
  unlock!: () => void;

  onchange: ((this: IScreenOrientation, ev: Event) => any) | null = null;

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

  const or = new ScreenOrientation();
  const found = findDelegate(or);

  ScreenOrientation.prototype.addEventListener = delegate(
    "addEventListener",
    found.delegate,
    found.event,
  );

  ScreenOrientation.prototype.dispatchEvent = delegate(
    "dispatchEvent",
    found.delegate,
    found.event,
  );

  ScreenOrientation.prototype.removeEventListener = delegate(
    "removeEventListener",
    found.delegate,
    found.event,
  );

  ScreenOrientation.prototype.lock = getLock();
  ScreenOrientation.prototype.unlock = getUnlock();

  Object.defineProperties(or, {
    onchange: {
      get() {
        return found.delegate["on" + found.event] || null;
      },
      set(cb: any) {
        found.delegate["on" + found.event] = wrapCallback(cb, or);
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
          (getMql().matches ? "landscape-primary" : "portrait-primary")
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
