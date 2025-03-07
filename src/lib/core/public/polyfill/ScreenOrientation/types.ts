
export interface IScreenOrientation extends ScreenOrientation {
  lock: (orientation: string) => Promise<void>;
}

export interface ExtendedScreen extends Screen {
  msOrientation?: string;
  mozOrientation?: string;
}

export interface EventDelegate {
  listeners: Record<string, Array<(evt: Event) => void>>;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  dispatchEvent: (event: Event) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => void;
}

export interface DelegateSearchResult {
  delegate: EventTarget | EventDelegate;
  eventName: string;
}
