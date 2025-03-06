import { RefObject, useEffect, useRef, useMemo } from "react";
import { IS_MOBILE, throttle } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

type TouchZone = "left" | "center" | "right" | "unknown";
type SwipeDirection = "up" | "down" | "left" | "right";

interface TouchControlConfig {
  swipeThreshold?: number;
  debounceTime: number;
  zoneRatios?: [number, number, number];
  enableSwipe?: boolean;
  enableDoubleTap?: boolean;
  doubleTapThreshold?: number;
  doubleTapMovement?: number;
  onZoneChange?: (zone: TouchZone) => void;
  onSwipe?: (direction: SwipeDirection, velocity: number) => void;
  onLeftZone?: () => void;
  onCenterZone?: () => void;
  onRightZone?: () => void;
  onDoubleTap?: (zone: TouchZone) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  currentZone: TouchZone;
  boundaries: { leftBound: number; centerBound: number };
}

const DEFAULT_CONFIG: TouchControlConfig = {
  swipeThreshold: 50,
  debounceTime: 300,
  zoneRatios: [0.3, 0.4, 0.3],
  enableSwipe: true,
  enableDoubleTap: false,
  doubleTapThreshold: 300,
  doubleTapMovement: 10,
};

const getZoneBoundaries = (
  element: HTMLElement,
  zoneRatios: [number, number, number],
) => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const [leftRatio, centerRatio] = zoneRatios;

  return {
    leftBound: rect.left + width * leftRatio,
    centerBound: rect.left + width * (leftRatio + centerRatio),
  };
};

export const useTouchControls = (
  elementRef: RefObject<HTMLElement | null>,
  config: TouchControlConfig = DEFAULT_CONFIG,
  disable = false,
) => {
  const touchState = useRef<TouchState | null>(null);
  const lastTouchTime = useRef(0);
  const lastTapDetails = useRef({
    time: 0,
    x: 0,
    y: 0,
    zone: "unknown" as TouchZone,
  });

  const mergedConfig = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config],
  );

  const {
    swipeThreshold,
    debounceTime,
    zoneRatios,
    enableSwipe,
    enableDoubleTap,
    doubleTapThreshold,
    doubleTapMovement,
    onCenterZone,
    onLeftZone,
    onRightZone,
    onSwipe,
    onZoneChange,
    onDoubleTap,
  } = mergedConfig;

  const detectSwipe = useStableCallback((endX: number, endY: number) => {
    if (!touchState.current || !enableSwipe) return;

    const { startX, startY, startTime } = touchState.current;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const duration = Date.now() - startTime;

    const velocity = Math.max(
      Math.abs(deltaX) / duration,
      Math.abs(deltaY) / duration,
    );

    if (Math.abs(deltaX) > swipeThreshold!) {
      onSwipe?.(deltaX > 0 ? "right" : "left", velocity);
    } else if (Math.abs(deltaY) > swipeThreshold!) {
      onSwipe?.(deltaY > 0 ? "down" : "up", velocity);
    }
  });

  const handleZoneAction = useStableCallback(
    throttle((zone: TouchZone) => {
      switch (zone) {
        case "left":
          onLeftZone?.();
          break;
        case "center":
          onCenterZone?.();
          break;
        case "right":
          onRightZone?.();
          break;
      }
    }, debounceTime),
  );

  const checkDoubleTap = useStableCallback(
    (startX: number, startY: number, currentZone: TouchZone) => {
      if (!enableDoubleTap) return;

      const { time, x, y, zone } = lastTapDetails.current;
      const currentTime = Date.now();
      const isWithinTime = currentTime - time <= doubleTapThreshold!;
      const isSamePosition =
        Math.abs(startX - x) <= doubleTapMovement! &&
        Math.abs(startY - y) <= doubleTapMovement!;
      const isSameZone = zone === currentZone;

      if (isWithinTime && isSamePosition && isSameZone) {
        onDoubleTap?.(currentZone);
        lastTapDetails.current = { time: 0, x: 0, y: 0, zone: "unknown" };
      } else {
        lastTapDetails.current = {
          time: currentTime,
          x: startX,
          y: startY,
          zone: currentZone,
        };
      }
    },
  );

  const handleTouchStart = useStableCallback((e: TouchEvent) => {
    if (Date.now() - lastTouchTime.current < debounceTime!) return;

    const touch = e.touches[0];
    const element = elementRef.current!;
    const boundaries = getZoneBoundaries(element, zoneRatios!);
    const clientX = touch.clientX;
    const currentZone = clientX < boundaries.leftBound
      ? "left"
      : clientX < boundaries.centerBound
        ? "center"
        : "right";

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      lastX: touch.clientX,
      lastY: touch.clientY,
      currentZone,
      boundaries,
    };

    onZoneChange?.(currentZone);
  });

  const handleTouchMove = useStableCallback((e: TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.touches[0];
    const clientX = touch.clientX;
    const { boundaries, currentZone } = touchState.current;

    const newZone = clientX < boundaries.leftBound
      ? "left"
      : clientX < boundaries.centerBound
        ? "center"
        : "right";

    if (newZone !== currentZone) {
      touchState.current.currentZone = newZone;
      onZoneChange?.(newZone);
    }

    touchState.current.lastX = touch.clientX;
    touchState.current.lastY = touch.clientY;
  });

  const handleTouchEnd = useStableCallback((_: TouchEvent) => {
    if (!touchState.current) return;

    const touch = touchState.current!;
    lastTouchTime.current = Date.now();

    const { lastX, lastY, currentZone, startX, startY } = touch;

    detectSwipe(lastX, lastY);
    handleZoneAction(currentZone);
    checkDoubleTap(startX, startY, currentZone);

    touchState.current = null;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disable || !IS_MOBILE) return;

    const listeners = {
      touchstart: handleTouchStart,
      touchmove: handleTouchMove,
      touchend: handleTouchEnd,
    };

    Object.entries(listeners).forEach(([event, handler]) => {
      element.addEventListener(event, handler as EventListener);
    });

    return () => {
      Object.entries(listeners).forEach(([event, handler]) => {
        element.removeEventListener(event, handler as EventListener);
      });
    };
  }, [elementRef, disable]);

  const getCurrentZone = useStableCallback(() => touchState.current?.currentZone || "unknown");
  const getTouchState = useStableCallback(() => touchState.current);

  return {
    getCurrentZone,
    getTouchState
  };
};
