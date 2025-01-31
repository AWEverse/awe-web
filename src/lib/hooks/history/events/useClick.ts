import { useStableCallback } from "@/shared/hooks/base";
import { RefObject, useEffect, useCallback, useRef } from "react";

type EventType = MouseEvent | TouchEvent;

const defaultEvents: string[] = ["mousedown", "touchstart"];

const useClickHandler = <E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClick: (event: E) => void,
  condition: (el: HTMLElement, target: Node) => boolean,
) => {
  const onClickRef = useRef(onClick);
  const conditionRef = useRef(condition);

  useEffect(() => {
    onClickRef.current = onClick;
    conditionRef.current = condition;
  }, [onClick, condition]);

  const handler = useCallback(
    (event: Event) => {
      if (window.TouchEvent && event instanceof TouchEvent) {
        if (event.touches.length > 1) return;
      }

      const { current: el } = ref;
      const target = event.target as Node;

      if (el && target instanceof Node) {
        if (conditionRef.current(el, target)) {
          onClickRef.current(event as unknown as E);
        }
      }
    },
    [ref],
  );

  useEffect(() => {
    const addListeners = () =>
      defaultEvents.forEach((eventName) => {
        const options =
          eventName === "touchstart" ? { passive: true } : undefined;
        document.addEventListener(eventName, handler, options);
      });

    const removeListeners = () =>
      defaultEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handler);
      });

    addListeners();
    return removeListeners;
  }, [handler]);
};

function useClickAway<E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: E) => void,
  disabled = false,
) {
  if (disabled) return;

  const condition = useStableCallback(
    (el: HTMLElement, target: Node) => !el.contains(target),
  );

  useClickHandler(ref, onClickAway, condition);
}

function useClickInside<E extends EventType = EventType>(
  ref: RefObject<HTMLElement | null>,
  onClickInside: (event: E) => void,
  disabled = false,
) {
  if (disabled) return;

  const condition = useStableCallback((el: HTMLElement, target: Node) =>
    el.contains(target),
  );

  useClickHandler(ref, onClickInside, condition);
}

export { useClickAway, useClickInside };
