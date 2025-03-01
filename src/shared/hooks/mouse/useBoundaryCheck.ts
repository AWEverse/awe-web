import { clamp, throttle } from "@/lib/core";
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
  options,
}: UseBoundaryCheckParams) {
  const {
    outboxSize = DEFAULT_OUTBOX_SIZE,
    throttleInterval = DEFAULT_THROTTLE_INTERVAL,
  } = options || {};

  useEffect(() => {
    if (!isActive) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    const boundaries = position ? calculateAdjustedBoundaries(
      position,
      outboxSize,
      extraPaddingX,
      rect
    ) : calculateDefaultBoundaries(rect, outboxSize);

    const handleMove = throttle((e: MouseEvent) => {
      const isOutside =
        e.clientX < boundaries.left ||
        e.clientX > boundaries.right ||
        e.clientY < boundaries.top ||
        e.clientY > boundaries.bottom;

      if (isOutside) onExit();
    }, throttleInterval);

    window.addEventListener("mousemove", handleMove);

    return () => window.removeEventListener("mousemove", handleMove);
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
) {

  const { width, height } = windowSize.dimensions;

  const spaceRight = width - position.x;
  const spaceLeft = position.x;

  let adjustedX = position.x;

  if (rect.width + paddingX <= spaceRight) {
    adjustedX += paddingX;
  } else if (rect.width + paddingX <= spaceLeft) {
    adjustedX -= rect.width + paddingX;
  } else {
    adjustedX = spaceRight > spaceLeft ? width - rect.width : 0;
  }

  const spaceBottom = height - position.y;
  const spaceTop = position.y;

  let adjustedY = position.y;
  if (rect.height <= spaceBottom) {
    adjustedY += 0;
  } else if (rect.height <= spaceTop) {
    adjustedY -= rect.height;
  } else {
    adjustedY = spaceBottom > spaceTop ? height - rect.height : 0;
  }

  adjustedX = clamp(adjustedX, 0, width - rect.width);
  adjustedY = clamp(adjustedY, 0, height - rect.height);

  return {
    left: Math.max(adjustedX - outboxSize, 0),
    right: Math.min(adjustedX + rect.width + outboxSize, width),
    top: Math.max(adjustedY - outboxSize, 0),
    bottom: Math.min(adjustedY + rect.height + outboxSize, height),
  };
}

function calculateDefaultBoundaries(
  rect: DOMRect,
  outboxSize: number,
) {
  const { width, height } = windowSize.dimensions;

  return {
    left: Math.max(rect.left - outboxSize, 0),
    right: Math.min(rect.right + outboxSize, width),
    top: Math.max(rect.top - outboxSize, 0),
    bottom: Math.min(rect.bottom + outboxSize, height),
  };
}
