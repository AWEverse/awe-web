import { RefObject, useEffect, useState } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { isSafariPatchInProgress } from "../../utils/patchSafariProgressiveAudio";
import { areDeepEqual } from "../../utils/areDeepEqual";
import { isMediaReadyToPlay } from "@/lib/core/public/misc/SafePlay";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";

// Avoid flickering when re-mounting previously buffered video
const DEBOUNCE = 200;
const MIN_ALLOWED_MEDIA_DURATION = 0.1; // Some video emojis have weird duration of 0.04 causing extreme amount of events

/**
 * Time range relative to the duration [0, 1]
 */

export type HTMLMediaBufferedEvent =
  | Event
  | React.SyntheticEvent<HTMLMediaElement>;
export type BufferedRange = { start: number; end: number };
export type BufferingEvent = (e: HTMLMediaBufferedEvent) => void;

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

interface UseBufferingOptions {
  mediaRef: RefObject<HTMLMediaElement | null>;
}

export function useBufferingObserver({ mediaRef }: UseBufferingOptions) {
  const observer = useStableCallback((e: HTMLMediaBufferedEvent) => {
    return e.target as HTMLMediaElement;
  });

  useEffect(() => {
    const mediaElement = mediaRef.current;

    if (mediaElement) {
      const events = [
        "play",
        "loadeddata",
        "playing",
        "loadstart", // Needed for Safari to start
        "pause", // Needed for Chrome when seeking
        "timeupdate", // Needed for audio buffering progress
        "progress", // Needed for buffering
      ];

      events.forEach((event) => mediaElement.addEventListener(event, observer));

      return () => {
        events.forEach((event) =>
          mediaElement.removeEventListener(event, observer),
        );
      };
    }
  }, [mediaRef, observer]);

  return {
    observer,
  };
}

const useBuffering = (
  noInitiallyBuffered = false,
  onTimeUpdate?: AnyToVoidFunction,
  onBroken?: (errMessage?: string) => void,
) => {
  const [isReady, setIsReady] = useState(false);
  const [isBuffered, _setIsBuffered] = useState(!noInitiallyBuffered);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);

  const setIsBuffered = useDebouncedFunction(
    _setIsBuffered,
    [],
    DEBOUNCE,
    false,
    true,
  );

  const handleBuffering = useStableCallback<BufferingEvent>((e) => {
    const media = e.currentTarget as HTMLMediaElement;
    const isMediaReady = isMediaReadyToPlay(media);

    if (media.duration < MIN_ALLOWED_MEDIA_DURATION) {
      onBroken?.("Video duration is too short duration!");
      return;
    }

    if (e.type === "timeupdate") {
      onTimeUpdate?.(e);
    }

    // Only safari: Safari has a bug where it doesn't update buffered ranges when seeking
    if (!isSafariPatchInProgress(media)) {
      if (media.buffered.length) {
        const ranges = getTimeRanges(media.buffered, media.duration);

        const bufferedLength = ranges.sum((range) => range.end - range.start);

        setBufferedProgress(bufferedLength / media.duration);

        setBufferedRanges((currentRanges) => {
          if (areDeepEqual(currentRanges, ranges)) {
            return currentRanges;
          }

          return ranges;
        });
      }

      setIsBuffered(media.currentTime > 0 || isMediaReady);
      setIsReady((current) => current || isMediaReady);
    }
  });

  const bufferingHandlers = {
    onPlay: handleBuffering,
    onLoadedData: handleBuffering,
    onPlaying: handleBuffering,
    onLoadStart: handleBuffering, // Needed for Safari to start
    onPause: handleBuffering, // Needed for Chrome when seeking
    onTimeUpdate: handleBuffering, // Needed for audio buffering progress
    onProgress: handleBuffering, // Needed for video buffering progress
  };

  return {
    isReady,
    isBuffered,
    bufferedProgress,
    bufferedRanges,
    bufferingHandlers,
    checkBuffering(element: HTMLMediaElement) {
      setIsBuffered(isMediaReadyToPlay(element));
    },
  };
};

export function getTimeRanges(ranges: TimeRanges, duration: number) {
  const result: BufferedRange[] = [];

  for (let i = 0; i < ranges.length; i++) {
    result.push({
      start: ranges.start(i) / duration,
      end: ranges.end(i) / duration,
    });
  }

  return result;
}

export default useBuffering;
