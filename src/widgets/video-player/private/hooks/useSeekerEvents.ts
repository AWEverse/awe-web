import { clamp } from "@/lib/core";
import { captureEvents } from "@/lib/utils/captureEvents";
import useResizeObserver from "@/shared/hooks/DOM/useResizeObserver";
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
  // useResizeObserver(seekerRef, () => {});

  useEffect(() => {
    let time = 0;
    let offset = 0;

    const calculatePreviewPosition = (e: MouseEvent | TouchEvent) => {
      if (!seekerRef.current) {
        return [0, 0];
      }

      const seeker = seekerRef.current;
      const seekerSize = seeker.getBoundingClientRect();

      const pageX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;

      time = clamp(
        duration * ((pageX - seekerSize.left) / seekerSize.width),
        0,
        duration,
      );

      if (isPreviewDisabled) {
        return [time, 0];
      }

      const preview = previewRef.current!;

      offset = clamp(
        pageX - seekerSize.left - preview.clientWidth / 2,
        -4,
        seekerSize.width - preview.clientWidth + 4,
      );
    };

    if (!seekerRef.current) {
      return undefined;
    }

    const seeker = seekerRef.current;

    const handleSeek = (e: MouseEvent | TouchEvent) => {
      calculatePreviewPosition(e);
      onSeek?.(time);
    };

    const handleStartSeek = () => {
      onSeekStart?.();
    };

    const handleStopSeek = (e: MouseEvent | TouchEvent) => {
      calculatePreviewPosition(e);
      onSeek?.(time);
      onSeekEnd?.(time);
    };

    const cleanup = captureEvents(seeker, {
      onCapture: handleStartSeek,
      onRelease: handleStopSeek,
      onClick: handleStopSeek,
      onDrag: handleSeek,
    });

    return cleanup;
  }, [duration, isActive, onSeek, onSeekStart, isPreviewDisabled]);
};

export default useSeekerEvents;
