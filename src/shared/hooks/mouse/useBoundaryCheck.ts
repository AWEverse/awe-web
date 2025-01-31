import { throttle } from "@/lib/core";
import { useEffect, RefObject } from "react";

interface UseBoundaryCheckParams {
  elementRef: RefObject<HTMLElement | null>;
  isActive: boolean;
  onExit: () => void;
  options?: {
    outboxSize?: number;
    throttleInterval?: number;
  };
}

const DEFAULT_OUTBOX_SIZE = 50;
const DEFAULT_THROTTLE_INTERVAL = 100;

export function useBoundaryCheck({
  elementRef,
  isActive,
  onExit,
  options,
}: UseBoundaryCheckParams) {
  const {
    outboxSize = DEFAULT_OUTBOX_SIZE,
    throttleInterval = DEFAULT_THROTTLE_INTERVAL,
  } = options || {};

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;

    const handleMove = throttle((e: MouseEvent) => {
      if (!element) return;

      const position = element.getBoundingClientRect();

      const boundaries = {
        top: position.top - outboxSize,
        left: position.left - outboxSize,
        right: position.right + outboxSize,
        bottom: position.bottom + outboxSize,
      };

      const isOutside =
        e.clientX < boundaries.left ||
        e.clientX > boundaries.right ||
        e.clientY < boundaries.top ||
        e.clientY > boundaries.bottom;

      if (isOutside) {
        onExit();
      }
    }, throttleInterval);

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [isActive, onExit, outboxSize, throttleInterval, elementRef]);
}
