import { throttle } from "@/lib/core";
import { useEffect, RefObject } from "react";

interface UseBoundaryCheckParams {
  elementRef: RefObject<HTMLElement | null>;
  isActive: boolean;
  onExit: () => void;
  position?: { x: number; y: number };
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
  position,
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
      const rect = element.getBoundingClientRect();

      const boundaries = position
        ? {
            top: position.y - outboxSize,
            left: position.x - outboxSize,
            right: position.x + rect.width + outboxSize,
            bottom: position.y + rect.height + outboxSize,
          }
        : {
            top: rect.top - outboxSize,
            left: rect.left - outboxSize,
            right: rect.right + outboxSize,
            bottom: rect.bottom + outboxSize,
          };

      const isOutside =
        e.clientX < boundaries.left ||
        e.clientX > boundaries.right ||
        e.clientY < boundaries.top ||
        e.clientY > boundaries.bottom;

      if (isOutside) {
        console.log("outside");
        onExit();
      }
    }, throttleInterval);

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [isActive, onExit, outboxSize, throttleInterval, elementRef]);
}
