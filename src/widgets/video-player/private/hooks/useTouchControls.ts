import { RefObject, useEffect, useRef, useMemo } from "react";
import { IS_MOBILE, throttle } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

type TouchZone = "left" | "center" | "right" | "unknown";
type SwipeDirection = "up" | "down" | "left" | "right";

interface TouchControlConfig {
  swipeThreshold?: number;
  debounceTime?: number;
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

export const useTouchControls = (
  elementRef: RefObject<HTMLElement | null>,
  config: TouchControlConfig = {},
  disable = false
) => {
  const touchState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lastY: number;
    currentZone: TouchZone;
    boundaries: { leftBound: number; centerBound: number };
  } | null>(null);

  const lastTouchTime = useRef(0);
  const lastTapDetails = useRef({
    time: 0,
    x: 0,
    y: 0,
    zone: "unknown" as TouchZone,
  });

  const {
    swipeThreshold = 50,
    debounceTime = 300,
    zoneRatios = [0.3, 0.4, 0.3],
    enableSwipe = true,
    enableDoubleTap = false,
    doubleTapThreshold = 300,
    doubleTapMovement = 10,
    onCenterZone,
    onLeftZone,
    onRightZone,
    onSwipe,
    onZoneChange,
    onDoubleTap,
  } = useMemo(() => ({ ...config }), [config]);

  const getZoneBoundaries = (element: HTMLElement) => {
    const { left, width } = element.getBoundingClientRect();
    const [leftRatio, centerRatio] = zoneRatios;

    return {
      leftBound: left + width * leftRatio,
      centerBound: left + width * (leftRatio + centerRatio),
    };
  };

  const detectSwipe = useStableCallback((endX: number, endY: number) => {
    if (!touchState.current || !enableSwipe) return;

    const { startX, startY, startTime } = touchState.current;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const duration = Date.now() - startTime;

    const velocity = Math.max(
      Math.abs(deltaX) / duration,
      Math.abs(deltaY) / duration
    );

    if (Math.abs(deltaX) > swipeThreshold) {
      onSwipe?.(deltaX > 0 ? "right" : "left", velocity);
    } else if (Math.abs(deltaY) > swipeThreshold) {
      onSwipe?.(deltaY > 0 ? "down" : "up", velocity);
    }
  });

  const handleZoneAction = useStableCallback(
    throttle((zone: TouchZone) => {
      const zoneActions = {
        left: onLeftZone,
        center: onCenterZone,
        right: onRightZone,
      };
      if (zone === "left" || zone === "center" || zone === "right") {
        zoneActions[zone]?.();
      }
    }, debounceTime)
  );

  const checkDoubleTap = useStableCallback(
    (startX: number, startY: number, currentZone: TouchZone) => {
      if (!enableDoubleTap) return;

      const { time, x, y, zone } = lastTapDetails.current;
      const currentTime = Date.now();
      const isDoubleTap =
        currentTime - time <= doubleTapThreshold &&
        Math.abs(startX - x) <= doubleTapMovement &&
        Math.abs(startY - y) <= doubleTapMovement &&
        zone === currentZone;

      if (isDoubleTap) {
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
    }
  );

  const handleTouchStart = useStableCallback((e: TouchEvent) => {
    if (Date.now() - lastTouchTime.current < debounceTime) return;

    const touch = e.touches[0];
    const element = elementRef.current!;
    const boundaries = getZoneBoundaries(element);
    const clientX = touch.clientX;
    const currentZone =
      clientX < boundaries.leftBound
        ? "left"
        : clientX < boundaries.centerBound
          ? "center"
          : "right";

    touchState.current = {
      startX: clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      lastX: clientX,
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

    const newZone =
      clientX < boundaries.leftBound
        ? "left"
        : clientX < boundaries.centerBound
          ? "center"
          : "right";

    if (newZone !== currentZone) {
      touchState.current.currentZone = newZone;
      onZoneChange?.(newZone);
    }

    touchState.current.lastX = clientX;
    touchState.current.lastY = touch.clientY;
  });

  const handleTouchEnd = useStableCallback((_: TouchEvent) => {
    if (!touchState.current) return;

    const { lastX, lastY, currentZone, startX, startY } = touchState.current;
    lastTouchTime.current = Date.now();

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

  const getCurrentZone = useStableCallback(() =>
    touchState.current?.currentZone || "unknown"
  );
  const getTouchState = useStableCallback(() => touchState.current);

  return { getCurrentZone, getTouchState };
};
