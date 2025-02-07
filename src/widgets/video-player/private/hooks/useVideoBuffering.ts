import { useCallback, useMemo, useState } from "react";
import { BTimeRanges, isMediaReadyToPlay } from "@/lib/core";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";

export const useVideoBuffering = () => {
  const [isReady, setReady] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useStateSignal<BufferedRange[]>(
    [],
  );

  const updateBuffering = useCallback(
    (e: Event | React.SyntheticEvent<HTMLMediaElement>) => {
      const media = e.currentTarget as HTMLMediaElement;
      const ranges = BTimeRanges.getBufferedInfo(media.buffered);

      setBufferedRanges(ranges);
      setReady(isMediaReadyToPlay(media));
    },
    [],
  );

  const handlersBuffering = useMemo(
    () => ({
      onPlay: updateBuffering,
      onPlaying: updateBuffering,
      onLoadedData: updateBuffering,
      onLoadStart: updateBuffering,
      onPause: updateBuffering,
      onTimeUpdate: updateBuffering,
      onProgress: updateBuffering,
    }),
    [updateBuffering],
  );

  return {
    isReady,
    bufferedRanges,
    handlersBuffering,
  };
};
