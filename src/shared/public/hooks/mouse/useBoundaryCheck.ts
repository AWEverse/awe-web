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
    const rect = element.getBoundingClientRect();
    const width = rect.width || element.offsetWidth;
    const height = rect.height || element.offsetHeight;
    const viewport = windowSize.dimensions;

    console.log("useBoundaryCheck",
      position,
      outboxSize,
      extraPaddingX,
      rect,
      width,
      height,
      viewport)

    const boundaries = position
      ? calculateAdjustedBoundaries(
        position,
        outboxSize,
        extraPaddingX,
        rect,
        width,
        height,
        viewport.width,
        viewport.height,
      )
      : calculateDefaultBoundaries(
        rect,
        outboxSize,
        viewport.width,
        viewport.height,
      );

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
  _rect: DOMRect, // unused, for signature compatibility
  menuWidth: number,
  menuHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const spaceRight = viewportWidth - position.x;
  const spaceLeft = position.x;
  const spaceBottom = viewportHeight - position.y;
  const spaceTop = position.y;

  // Take into account menu size (with scale, transforms, etc)
  let adjustedX = position.x + paddingX;
  let adjustedY = position.y;

  // Prefer to show right/bottom, fallback to left/top if not enough space
  if (menuWidth + paddingX > spaceRight && menuWidth + paddingX <= spaceLeft) {
    adjustedX = position.x - menuWidth - paddingX;
  } else if (menuWidth + paddingX > spaceRight && menuWidth + paddingX > spaceLeft) {
    // Not enough space either side, clamp to viewport
    adjustedX = Math.max(0, viewportWidth - menuWidth);
  }

  if (menuHeight > spaceBottom && menuHeight <= spaceTop) {
    adjustedY = position.y - menuHeight;
  } else if (menuHeight > spaceBottom && menuHeight > spaceTop) {
    // Not enough space either above or below, clamp to viewport
    adjustedY = Math.max(0, viewportHeight - menuHeight);
  }

  const clampedX = clamp(adjustedX, 0, viewportWidth - menuWidth);
  const clampedY = clamp(adjustedY, 0, viewportHeight - menuHeight);

  return {
    left: Math.max(clampedX - outboxSize, 0),
    right: Math.min(clampedX + menuWidth + outboxSize, viewportWidth),
    top: Math.max(clampedY - outboxSize, 0),
    bottom: Math.min(clampedY + menuHeight + outboxSize, viewportHeight),
  };
}

function calculateDefaultBoundaries(
  rect: DOMRect,
  outboxSize: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  // Use actual rect (with scale, transforms, etc)
  return {
    left: Math.max(rect.left - outboxSize, 0),
    right: Math.min(rect.right + outboxSize, viewportWidth),
    top: Math.max(rect.top - outboxSize, 0),
    bottom: Math.min(rect.bottom + outboxSize, viewportHeight),
  };
}
