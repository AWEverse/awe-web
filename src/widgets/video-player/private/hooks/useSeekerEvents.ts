import { clamp } from "@/lib/core";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";
import { captureEvents } from "@/lib/utils/captureEvents";
import { useStableCallback } from "@/shared/hooks/base";
import { useEffect } from "react";

interface SeekerEventsProps {
  seekerRef: React.RefObject<HTMLDivElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onSeek?: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: (endPoint: number) => void;
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
  // Using stable callback references to prevent unnecessary effect re-runs
  const stableOnSeek = useStableCallback(onSeek);
  const stableOnSeekStart = useStableCallback(onSeekStart);
  const stableOnSeekEnd = useStableCallback(onSeekEnd);

  useEffect(() => {
    const seeker = seekerRef.current;
    const preview = previewRef.current;
    if (!seeker || !isActive) return;

    // Cache frequently used values
    let seekerRect: DOMRect;
    let previewWidth = 0;
    let minOffset = -4;
    let maxOffset = 0;

    const updateLayoutCache = () => {
      requestMeasure(() => {
        seekerRect = seeker.getBoundingClientRect();
        previewWidth = preview?.clientWidth || 0;
        maxOffset = seekerRect.width - previewWidth + 4;
      });
    };

    const calculatePosition = (clientX: number): [number, number] => {
      const relativeX = clamp(
        (clientX - seekerRect.left) / seekerRect.width,
        0,
        1,
      );
      const time = relativeX * duration;

      if (isPreviewDisabled || !preview) return [time, 0];

      const offsetBase = clientX - seekerRect.left - previewWidth / 2;
      return [time, clamp(offsetBase, minOffset, maxOffset)];
    };

    const handleDrag = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const [time] = calculatePosition(clientX);

      stableOnSeek?.(time);
    };

    const handleStop = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.changedTouches?.[0]?.clientX : e.clientX;
      const [time] = calculatePosition(clientX);

      stableOnSeek?.(time);
      stableOnSeekEnd?.(time);
    };

    // Initial layout measurement
    updateLayoutCache();

    const cleanup = captureEvents(seeker, {
      onCapture: () => {
        updateLayoutCache();
        stableOnSeekStart?.();
      },
      onRelease: handleStop,
      onClick: handleStop,
      onDrag: handleDrag,
    });

    return () => {
      cleanup?.();
    };
  }, [
    isActive,
    duration,
    isPreviewDisabled,
    seekerRef,
    previewRef,
    stableOnSeek,
    stableOnSeekStart,
    stableOnSeekEnd,
  ]);
};

export default useSeekerEvents;
