export const noop = () => {};

type AnyEntity = Window | Document | HTMLElement | EventTarget;
type EventListenerArgs = [string, EventListenerOrEventListenerObject, ...unknown[]];

export function on<T extends AnyEntity>(obj: T | null, ...args: EventListenerArgs): void {
  if (obj) {
    obj.addEventListener(...(args as Parameters<HTMLElement['addEventListener']>));
  }
}

export function off<T extends AnyEntity>(obj: T | null, ...args: EventListenerArgs): void {
  if (obj) {
    obj.removeEventListener(...(args as Parameters<HTMLElement['removeEventListener']>));
  }
}
