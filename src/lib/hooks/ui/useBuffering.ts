import { useState, useMemo } from 'react';
import useLastCallback from '../events/useLastCallback';
import { debounce } from '../../utils/schedulers';
import { isSafariPatchInProgress } from '../../utils/patchSafariProgressiveAudio';
import { areDeepEqual } from '../../utils/areDeepEqual';

type BufferingEvent = (e: Event | React.SyntheticEvent<HTMLMediaElement>) => void;

const MIN_READY_STATE = 3;
// Avoid flickering when re-mounting previously buffered video
const DEBOUNCE = 200;
const MIN_ALLOWED_MEDIA_DURATION = 0.1; // Some video emojis have weird duration of 0.04 causing extreme amount of events

/**
 * Time range relative to the duration [0, 1]
 */
export type BufferedRange = { start: number; end: number };

const useBuffering = (
  noInitiallyBuffered = false,
  onTimeUpdate?: AnyToVoidFunction,
  onBroken?: AnyToVoidFunction,
) => {
  const [isBuffered, _setIsBuffered] = useState(!noInitiallyBuffered);
  const [isReady, setIsReady] = useState(false);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);

  const setIsBuffered = useMemo(() => {
    return debounce(_setIsBuffered, DEBOUNCE, false, true);
  }, []);

  const handleBuffering = useLastCallback<BufferingEvent>(e => {
    const media = e.currentTarget as HTMLMediaElement;
    const isMediaReady = media.readyState >= MIN_READY_STATE;

    if (media.duration < MIN_ALLOWED_MEDIA_DURATION) {
      onBroken?.();
      return;
    }

    if (e.type === 'timeupdate') {
      onTimeUpdate?.(e);
    }

    if (!isSafariPatchInProgress(media)) {
      if (Boolean(media.buffered.length)) {
        const ranges = getTimeRanges(media.buffered, media.duration);

        const bufferedLength = ranges.sum(range => range.end - range.start);

        setBufferedProgress(bufferedLength / media.duration);

        setBufferedRanges(currentRanges =>
          areDeepEqual(currentRanges, ranges) ? currentRanges : ranges,
        );
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
      setIsBuffered(element.readyState >= MIN_READY_STATE);
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
