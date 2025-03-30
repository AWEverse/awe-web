import { clamp } from "@/lib/core";
import { requestMeasure, requestMutation } from "@/lib/modules/fastdom";
import { useStableCallback } from "@/shared/hooks/base";
import { useCallback, useEffect, useRef } from "react";

interface SeekerEventsProps {
  seekerRef: React.RefObject<HTMLElement | null>;
  previewRef?: React.RefObject<HTMLElement | null>;
  onSeek?: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: (time: number) => void;
  isPreviewDisabled?: boolean;
  isActive: boolean;
  duration: number;
}

const useSeekerEvents = ({
  seekerRef,
  previewRef,
  onSeek,
  onSeekStart,
  onSeekEnd,
  isPreviewDisabled,
  isActive,
  duration,
}: SeekerEventsProps) => {
  const stableOnSeek = useStableCallback(onSeek);
  const stableOnSeekStart = useStableCallback(onSeekStart);
  const stableOnSeekEnd = useStableCallback(onSeekEnd);

  const stateRef = useRef({
    pointerId: -1,
    lastOffset: 0,
    layout: {
      seekerRect: new DOMRect(),
      previewWidth: 0,
      minOffset: 0,
      maxOffset: 0,
    },
    isDragging: false,
  });

  const updateLayout = useCallback(() => {
    const seeker = seekerRef.current;
    if (!seeker) return;

    requestMeasure(() => {
      const seekerRect = seeker.getBoundingClientRect();
      const previewWidth = previewRef?.current?.clientWidth || 0;

      stateRef.current.layout = {
        seekerRect,
        previewWidth,
        minOffset: -4,
        maxOffset: seekerRect.width - previewWidth + 4,
      };
    });
  }, [seekerRef, previewRef]);

  const calculatePosition = useCallback((clientX: number): [number, number] => {
    const { layout } = stateRef.current;
    const relativeX = clamp(
      (clientX - layout.seekerRect.left) / layout.seekerRect.width,
      0,
      1
    );
    const time = relativeX * duration;

    if (isPreviewDisabled || !previewRef?.current) {
      return [time, 0];
    }

    const offsetBase = clientX - layout.seekerRect.left - layout.previewWidth / 2;
    return [time, clamp(offsetBase, layout.minOffset, layout.maxOffset)];
  }, [duration, isPreviewDisabled, previewRef]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.pointerId !== stateRef.current.pointerId) return;

    const [time, offset] = calculatePosition(e.clientX);
    stableOnSeek?.(time);

    if (previewRef?.current && !isPreviewDisabled && offset !== stateRef.current.lastOffset) {
      stateRef.current.lastOffset = offset;
      requestMutation(() => {
        const preview = previewRef.current;
        if (preview) {
          preview.style.transform = `translateX(${offset}px)`;
        }
      });
    }
  }, [calculatePosition, stableOnSeek, isPreviewDisabled, previewRef]);

  const cleanupPointer = useCallback(() => {
    const seeker = seekerRef.current;
    if (stateRef.current.pointerId !== -1 && seeker) {
      seeker.releasePointerCapture(stateRef.current.pointerId);
      stateRef.current.pointerId = -1;
      stateRef.current.isDragging = false;
    }
  }, [seekerRef]);

  useEffect(() => {
    const seeker = seekerRef.current;
    if (!seeker || !isActive) return;

    seeker.style.touchAction = "none";

    const handlePointerDown = (e: PointerEvent) => {
      if (stateRef.current.isDragging) return;

      seeker.setPointerCapture(e.pointerId);
      stateRef.current.pointerId = e.pointerId;
      stateRef.current.isDragging = true;
      updateLayout();
      stableOnSeekStart?.();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== stateRef.current.pointerId) return;

      const [time] = calculatePosition(e.clientX);
      stableOnSeekEnd?.(time);
      cleanupPointer();
    };

    const eventListeners: [keyof HTMLElementEventMap, EventListener][] = [
      ["pointerdown", handlePointerDown as EventListener],
      ["pointermove", handlePointerMove as EventListener],
      ["pointerup", handlePointerUp as EventListener],
      ["pointercancel", cleanupPointer as EventListener],
      ["pointerleave", cleanupPointer as EventListener],
    ];

    eventListeners.forEach(([event, listener]) => {
      seeker.addEventListener(event, listener);
    });

    return () => {
      seeker.style.touchAction = "";
      eventListeners.forEach(([event, listener]) => {
        seeker.removeEventListener(event, listener);
      });
      cleanupPointer();
    };
  }, [
    isActive,
    seekerRef,
    stableOnSeekStart,
    stableOnSeekEnd,
    handlePointerMove,
    calculatePosition,
    updateLayout,
    cleanupPointer,
  ]);

  return {
    updateLayout,
    calculatePosition,
  };
};

export default useSeekerEvents;
