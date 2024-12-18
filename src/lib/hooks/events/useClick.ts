import { RefObject, useEffect, MouseEvent, TouchEvent } from 'react';
import { off, on } from '../../utils/listener';

type EventType = MouseEvent | TouchEvent;

const defaultEvents: string[] = ['mousedown', 'touchstart'];

const useClickHandler = <E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClick: (event: E) => void,
  condition: (el: HTMLElement, target: Node) => boolean,
) => {
  const handler = (event: Event) => {
    const { current: el } = ref;

    if (el) {
      if (condition(el, event.target as Node)) {
        onClick(event as unknown as E);
      }
    }
  };

  useEffect(() => {
    const addEventListeners = () => {
      defaultEvents.forEach(eventName => on(document, eventName, handler));
    };

    const removeEventListeners = () => {
      defaultEvents.forEach(eventName => off(document, eventName, handler));
    };

    addEventListeners();

    return removeEventListeners;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

function useClickAway<E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: E) => void,
) {
  useClickHandler(ref, onClickAway, (el, target) => !el.contains(target));
}

function useClickInside<E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClickInside: (event: E) => void,
) {
  useClickHandler(ref, onClickInside, (el, target) => el.contains(target));
}

export { useClickAway, useClickInside };
