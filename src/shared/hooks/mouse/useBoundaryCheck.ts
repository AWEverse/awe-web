import { throttle } from "@/lib/core";
import { useEffect, RefObject } from "react";

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

    const handleMove = throttle((e: MouseEvent) => {
      const element = elementRef.current;
      if (!element) return;

      const docEl = document.documentElement;
      const viewport = {
        width: docEl.clientWidth,
        height: docEl.clientHeight,
      };
      const rect = element.getBoundingClientRect();

      let boundaries: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      };

      if (position) {
        boundaries = calculateAdjustedBoundaries(
          position,
          outboxSize,
          extraPaddingX,
          viewport,
          rect,
        );
      } else {
        boundaries = calculateDefaultBoundaries(rect, outboxSize, viewport);
      }

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
  viewport: { width: number; height: number },
  rect: DOMRect,
) {
  // X-axis adjustment
  const spaceRight = viewport.width - position.x;
  const spaceLeft = position.x;
  const totalWidth = rect.width + paddingX;

  let adjustedX = position.x;

  if (totalWidth <= spaceRight) {
    adjustedX += paddingX;
  } else {
    const totalWidthLeft = rect.width + paddingX;

    if (totalWidthLeft <= spaceLeft) {
      adjustedX -= totalWidthLeft;
    } else {
      adjustedX = spaceRight > spaceLeft ? viewport.width - rect.width : 0;
    }
  }

  // Y-axis adjustment
  const spaceBottom = viewport.height - position.y;
  const spaceTop = position.y;

  let adjustedY = position.y;

  if (rect.height <= spaceBottom) {
    adjustedY = position.y;
  } else {
    adjustedY =
      rect.height <= spaceTop
        ? position.y - rect.height
        : spaceBottom > spaceTop
          ? viewport.height - rect.height
          : 0;
  }

  // Clamp adjusted positions to viewport
  adjustedX = Math.max(0, Math.min(adjustedX, viewport.width - rect.width));
  adjustedY = Math.max(0, Math.min(adjustedY, viewport.height - rect.height));

  return {
    left: Math.max(adjustedX - outboxSize, 0),
    right: Math.min(adjustedX + rect.width + outboxSize, viewport.width),
    top: Math.max(adjustedY - outboxSize, 0),
    bottom: Math.min(adjustedY + rect.height + outboxSize, viewport.height),
  };
}

function calculateDefaultBoundaries(
  rect: DOMRect,
  outboxSize: number,
  viewport: { width: number; height: number },
) {
  return {
    left: Math.max(rect.left - outboxSize, 0),
    right: Math.min(rect.right + outboxSize, viewport.width),
    top: Math.max(rect.top - outboxSize, 0),
    bottom: Math.min(rect.bottom + outboxSize, viewport.height),
  };
}
