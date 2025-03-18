import { IS_BROWSER } from '@/lib/core';
import { useEffect, useRef, useCallback } from 'react';

type EventHandler = (...args: any[]) => void;

export interface ListenerType1 {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) => void;
}

export interface ListenerType2 {
  on: (type: string, handler: EventHandler, ...args: any[]) => void;
  off: (type: string, handler: EventHandler, ...args: any[]) => void;
}

export type EventTargetType = ListenerType1 | ListenerType2;

type EventOptions<T> = T extends ListenerType1
  ? boolean | AddEventListenerOptions
  : T extends ListenerType2
  ? any
  : never;

const defaultTarget = IS_BROWSER ? window : null;

const isListenerType1 = (target: any): target is ListenerType1 =>
  typeof target?.addEventListener === 'function';

const isListenerType2 = (target: any): target is ListenerType2 =>
  typeof target?.on === 'function';

interface useEventListenersOptions<T extends EventTargetType> {
  target?: T | null;
  options?: EventOptions<T>;
  enabled?: boolean;
  debounce?: number;
}

export const useEventListeners = <T extends EventTargetType>(
  eventName: string,
  handler: EventHandler | null | undefined,
  config: useEventListenersOptions<T> = {}
) => {
  const {
    target = defaultTarget as T | null,
    options,
    enabled = true,
    debounce = 0
  } = config;

  const handlerRef = useRef<EventHandler | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const debouncedHandler = useCallback((...args: any[]) => {
    if (debounce > 0 && handlerRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        handlerRef.current?.(...args);
      }, debounce);
    } else {
      handlerRef.current?.(...args);
    }
  }, [debounce]);

  useEffect(() => {
    handlerRef.current = handler ?? null;
  }, [handler]);

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !handler || !target) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    const listener = debounce > 0 ? debouncedHandler : handler;

    if (isListenerType1(target)) {
      target.addEventListener(eventName, listener, options);
      cleanupRef.current = () => {
        target.removeEventListener(eventName, listener, options);
      };
    } else if (isListenerType2(target)) {
      target.on(eventName, listener, options);
      cleanupRef.current = () => {
        target.off(eventName, listener, options);
      };
    }

    return () => {
      cleanupRef.current?.();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    eventName,
    target,
    enabled,
    debounce,
    options ? JSON.stringify(options) : null
  ]);

  return {
    isActive: !!cleanupRef.current,
    disable: () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    },
    enable: () => {
      // Re-run effect by toggling enabled state would be needed
      // This would require a state management solution
    }
  };
};

// Usage examples:
/*
// Basic usage
useEventListeners('click', (e) => console.log('Clicked'), {
  target: window
});

// With options
useEventListeners('scroll', handleScroll, {
  target: document,
  options: { passive: true, capture: false },
  enabled: isComponentActive,
  debounce: 200
});

// With custom event target
const customEmitter = new CustomEventEmitter();
useEventListeners('customEvent', handleCustomEvent, {
  target: customEmitter
});
*/
