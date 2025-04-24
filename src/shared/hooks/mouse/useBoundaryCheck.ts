import { clamp, IS_MOBILE, throttle } from "@/lib/core";
import { useEffect, RefObject } from "react";
import windowSize from "@/lib/utils/windowSize";

interface UseBoundaryCheckParams {
  elementRef: RefObject<HTMLElement | null>;
  isActive: boolean;
  onExit: () => void;
  position?: { x: number; y: number };
  extraPaddingX?: number;
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
  extraPaddingX = 0,
  onExit,
  options = {},
}: UseBoundaryCheckParams) {
  const {
    outboxSize = DEFAULT_OUTBOX_SIZE,
    throttleInterval = DEFAULT_THROTTLE_INTERVAL,
  } = options;

  useEffect(() => {
    if (!isActive || IS_MOBILE || !elementRef.current) return;

    const element = elementRef.current;
    const { width, height } = windowSize.dimensions;
    const rect = element.getBoundingClientRect();

    const boundaries = position
      ? calculateAdjustedBoundaries(
        position,
        outboxSize,
        extraPaddingX,
        rect,
        width,
        height,
      )
      : calculateDefaultBoundaries(rect, outboxSize, width, height);

    const handleMove = throttle((e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const isOutside =
        clientX < boundaries.left ||
        clientX > boundaries.right ||
        clientY < boundaries.top ||
        clientY > boundaries.bottom;

      if (isOutside) onExit();
    }, throttleInterval);

    const events = IS_MOBILE
      ? [
        ["touchmove", handleMove],
        ["touchend", onExit],
      ]
      : [["mousemove", handleMove]];

    events.forEach(([event, handler]) =>
      window.addEventListener(event as string, handler as EventListener),
    );

    return () =>
      events.forEach(([event, handler]) =>
        window.removeEventListener(event as string, handler as EventListener),
      );
  }, [
    isActive,
    onExit,
    outboxSize,
    throttleInterval,
    elementRef,
    position,
    extraPaddingX,
  ]);
}

function calculateAdjustedBoundaries(
  position: { x: number; y: number },
  outboxSize: number,
  paddingX: number,
  rect: DOMRect,
  width: number,
  height: number,
) {
  const spaceRight = width - position.x;
  const spaceLeft = position.x;
  const spaceBottom = height - position.y;
  const spaceTop = position.y;

  const adjustedX = (() => {
    if (rect.width + paddingX <= spaceRight) return position.x + paddingX;
    if (rect.width + paddingX <= spaceLeft)
      return position.x - rect.width - paddingX;
    return spaceRight > spaceLeft ? width - rect.width : 0;
  })();

  const adjustedY = (() => {
    if (rect.height <= spaceBottom) return position.y;
    if (rect.height <= spaceTop) return position.y - rect.height;
    return spaceBottom > spaceTop ? height - rect.height : 0;
  })();

  const clampedX = clamp(adjustedX, 0, width - rect.width);
  const clampedY = clamp(adjustedY, 0, height - rect.height);

  return {
    left: Math.max(clampedX - outboxSize, 0),
    right: Math.min(clampedX + rect.width + outboxSize, width),
    top: Math.max(clampedY - outboxSize, 0),
    bottom: Math.min(clampedY + rect.height + outboxSize, height),
  };
}

function calculateDefaultBoundaries(
  rect: DOMRect,
  outboxSize: number,
  width: number,
  height: number,
) {
  return {
    left: Math.max(rect.left - outboxSize, 0),
    right: Math.min(rect.right + outboxSize, width),
    top: Math.max(rect.top - outboxSize, 0),
    bottom: Math.min(rect.bottom + outboxSize, height),
  };
}
