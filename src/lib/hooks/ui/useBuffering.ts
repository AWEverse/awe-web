import { useState, useMemo } from 'react';
import useLastCallback from '../events/useLastCallback';
import { debounce } from '@/lib/core';
import { isSafariPatchInProgress } from '../../utils/patchSafariProgressiveAudio';
import { areDeepEqual } from '../../utils/areDeepEqual';
import { isMediaReadyToPlay } from '@/lib/core/public/misc/SafePlay';
import useDebouncedCallback from '../shedulers/useDebouncedCallback';

const MIN_READY_STATE = 3;
// Avoid flickering when re-mounting previously buffered video
const DEBOUNCE = 200;
const MIN_ALLOWED_MEDIA_DURATION = 0.1; // Some video emojis have weird duration of 0.04 causing extreme amount of events

/**
 * Time range relative to the duration [0, 1]
 */

export type HTMLMediaBufferedEvent = Event | React.SyntheticEvent<HTMLMediaElement>;
export type BufferedRange = { start: number; end: number };
export type BufferingEvent = (e: HTMLMediaBufferedEvent) => void;

export type BufferingPair<T = BufferingEvent> = {
  [key: string]: T;
};

const useBuffering = (
  noInitiallyBuffered = false,
  onTimeUpdate?: AnyToVoidFunction,
  onBroken?: AnyToVoidFunction,
) => {
  const [isBuffered, _setIsBuffered] = useState(!noInitiallyBuffered);
  const [isReady, setIsReady] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);

  const setIsBuffered = useDebouncedCallback(_setIsBuffered, [], DEBOUNCE, false, true);

  const handleBuffering = useLastCallback<BufferingEvent>(e => {
    const media = e.currentTarget as HTMLMediaElement;
    const isMediaReady = isMediaReadyToPlay(media);

    if (media.duration < MIN_ALLOWED_MEDIA_DURATION) {
      onBroken?.();
      return;
    }

    if (e.type === 'timeupdate') {
      onTimeUpdate?.(e);
    }

    // Only safari: Safari has a bug where it doesn't update buffered ranges when seeking
    if (!isSafariPatchInProgress(media)) {
      if (Boolean(media.buffered.length)) {
        const ranges = getTimeRanges(media.buffered, media.duration);

        const bufferedLength = ranges.sum(range => range.end - range.start);

        setBufferedProgress(bufferedLength / media.duration);

        setBufferedRanges(currentRanges => {
          if (areDeepEqual(currentRanges, ranges)) {
            return currentRanges;
          }

          return ranges;
        });
      }

      setIsBuffered(isMediaReady || media.currentTime > 0);
      setIsReady(current => current || isMediaReady);
    }
  });

  const bufferingHandlers = {
    onPLay: handleBuffering,
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

function getTimeRanges(ranges: TimeRanges, duration: number) {
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
