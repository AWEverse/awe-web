import { clamp } from "@/lib/core";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";
import { useStableCallback } from "@/shared/hooks/base";
import { useEffect, useRef } from "react";

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

  const pointerId = useRef<number>(-1);

  const layoutCache = useRef<{
    seekerRect: DOMRect;
    previewWidth: number;
    minOffset: number;
    maxOffset: number;
  }>({
    seekerRect: new DOMRect(),
    previewWidth: 0,
    minOffset: 0,
    maxOffset: 0
  });

  useEffect(() => {
    const seeker = seekerRef.current;
    if (!seeker || !isActive) return;

    const updateLayoutCache = () => {
      requestMeasure(() => {
        const seekerRect = seeker.getBoundingClientRect();
        const previewWidth = previewRef?.current?.clientWidth || 0;

        layoutCache.current = {
          seekerRect,
          previewWidth,
          minOffset: -4,
          maxOffset: seekerRect.width - previewWidth + 4
        };
      });
    };

    const calculatePosition = (clientX: number) => {
      const cache = layoutCache.current;
      if (!cache) return [0, 0];

      const relativeX = clamp(
        (clientX - cache.seekerRect.left) / cache.seekerRect.width,
        0,
        1
      );

      const time = relativeX * duration;

      if (isPreviewDisabled || !previewRef?.current) {
        return [time, 0];
      }

      const offsetBase = clientX - cache.seekerRect.left - cache.previewWidth / 2;
      return [time, clamp(offsetBase, cache.minOffset, cache.maxOffset)];
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (pointerId.current !== -1) return;

      seeker.setPointerCapture(e.pointerId);
      pointerId.current = e.pointerId;
      updateLayoutCache();
      stableOnSeekStart?.();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return;

      const [time] = calculatePosition(e.clientX);
      stableOnSeek?.(time);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId.current) return;

      const [time] = calculatePosition(e.clientX);
      stableOnSeekEnd?.(time);
      releasePointer();
    };

    const handlePointerCancel = () => {
      releasePointer();
    };

    const releasePointer = () => {
      if (pointerId.current === -1) return;

      seeker.releasePointerCapture(pointerId.current);
      pointerId.current = -1;
    };

    seeker.style.touchAction = 'none';

    seeker.addEventListener('pointerdown', handlePointerDown);
    seeker.addEventListener('pointermove', handlePointerMove);
    seeker.addEventListener('pointerup', handlePointerUp);
    seeker.addEventListener('pointercancel', handlePointerCancel);
    seeker.addEventListener('pointerleave', handlePointerCancel);

    return () => {
      seeker.style.touchAction = '';
      seeker.removeEventListener('pointerdown', handlePointerDown);
      seeker.removeEventListener('pointermove', handlePointerMove);
      seeker.removeEventListener('pointerup', handlePointerUp);
      seeker.removeEventListener('pointercancel', handlePointerCancel);
      seeker.removeEventListener('pointerleave', handlePointerCancel);
      releasePointer();
    };
  }, [
    isActive,
    duration,
    isPreviewDisabled,
    seekerRef,
    previewRef,
    stableOnSeek,
    stableOnSeekStart,
    stableOnSeekEnd
  ]);
};

export default useSeekerEvents;
