import { RefObject, useEffect, useState } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { areDeepEqual } from "../../utils/areDeepEqual";
import { isMediaReadyToPlay } from "@/lib/core";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";

const DEBOUNCE = 200;
const MIN_ALLOWED_MEDIA_DURATION = 0.1;

export type BufferedRange = { start: number; end: number };
export type BufferingEvent = (e: Event | React.SyntheticEvent<HTMLMediaElement>) => void;

interface UseBufferingOptions {
  mediaRef: RefObject<HTMLMediaElement | null>;
  noInitiallyBuffered?: boolean;
  onTimeUpdate?: (e?: Event | React.SyntheticEvent<HTMLMediaElement>) => void;
  onBroken?: (errMessage?: string) => void;

}

export type HTMLMediaBufferedEvent =
  | Event
  | React.SyntheticEvent<HTMLMediaElement>;

export type BufferedCallback = {
  isReady: boolean;
  isBuffered: boolean;
  bufferedProgress: number;
  bufferedRanges: BufferedRange[];
  bufferingHandlers: BufferingPair<BufferingEvent>;
  checkBuffering(element: HTMLMediaElement): void;
};

export type BufferingPair<T = BufferingEvent> = {
  [key: string]: T;
};

export type ObserveBufferingFn = (target: HTMLMediaBufferedEvent) => void;


export default function useBuffering({
  mediaRef,
  noInitiallyBuffered = false,
  onTimeUpdate,
  onBroken,
}: UseBufferingOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isBuffered, _setIsBuffered] = useState(!noInitiallyBuffered);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);

  const setIsBuffered = useDebouncedFunction(
    _setIsBuffered,
    DEBOUNCE,
    false,
    true
  );

  const handleBuffering = useStableCallback((e: any) => {
    const media = e.currentTarget as HTMLMediaElement;
    if (!media) return;

    if (media.duration < MIN_ALLOWED_MEDIA_DURATION) {
      onBroken?.("Media duration is too short");
      return;
    }

    if (e.type === "timeupdate") onTimeUpdate?.(e);

    // Skip updates during seeking
    if (media.seeking) return;

    // Handle buffered ranges and progress
    if (media.buffered.length > 0) {
      const ranges = getTimeRanges(media.buffered, media.duration);

      const newProgress = isFinite(media.duration)
        ? calculateBufferedProgress(ranges, media.duration)
        : 1; // Assume full progress for live streams

      setBufferedProgress(newProgress);
      updateBufferedRanges(ranges);
    }

    const mediaReady = isMediaReadyToPlay(media);
    setIsBuffered(media.currentTime > 0 || mediaReady);
    setIsReady(prev => prev || mediaReady);
  });

  const updateBufferedRanges = (ranges: BufferedRange[]) => {
    setBufferedRanges(prev => areDeepEqual(prev, ranges) ? prev : ranges);
  };

  // Initial state check
  useEffect(() => {
    const media = mediaRef.current;
    if (media) {
      setIsBuffered(isMediaReadyToPlay(media));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaRef]);

  return {
    isReady,
    isBuffered,
    bufferedProgress,
    bufferedRanges,
    bufferingHandlers: {
      onPlay: handleBuffering,
      onLoadedData: handleBuffering,
      onPlaying: handleBuffering,
      onLoadStart: handleBuffering,
      onPause: handleBuffering,
      onTimeUpdate: handleBuffering,
      onProgress: handleBuffering,
      onWaiting: handleBuffering,
      onStalled: handleBuffering,
      onCanPlay: handleBuffering,
      onSeeked: handleBuffering,
    },
    checkBuffering: (media: HTMLMediaElement) => {
      setIsBuffered(isMediaReadyToPlay(media));
    },
  };
}

// Helper functions
function getTimeRanges(ranges: TimeRanges, duration: number): BufferedRange[] {
  const result: BufferedRange[] = [];
  for (let i = 0; i < ranges.length; i++) {
    result.push({
      start: ranges.start(i) / (isFinite(duration) ? duration : 1),
      end: ranges.end(i) / (isFinite(duration) ? duration : 1),
    });
  }
  return result;
}

function calculateBufferedProgress(ranges: BufferedRange[], duration: number): number {
  const bufferedLength = ranges.reduce(
    (acc, range) => acc + (range.end - range.start),
    0
  );
  return bufferedLength / duration;
}
