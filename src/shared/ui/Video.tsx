import { onIdleComplete } from '@/lib/core';
import useEffectSync from '@/lib/hooks/effects/useEffectSync';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { useStateRef } from '@/lib/hooks/state/useStateRef';
import useBuffering from '@/lib/hooks/ui/useBuffering';
import unloadVideo from '@/lib/utils/unloadVideo';
import { useRef, useMemo, memo, useLayoutEffect } from 'react';
import useVideoCleanup from '../hooks/useVideoCleanup';

type VideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type OwnProps = {
  ref?: React.RefObject<HTMLVideoElement>;
  isPriority?: boolean;
  canPlay: boolean;
  children?: React.ReactNode;
  onReady?: NoneToVoidFunction;
  onBroken?: NoneToVoidFunction;
} & VideoProps;

function Video({
  ref,
  isPriority,
  canPlay,
  children,
  onReady,
  onBroken,
  onTimeUpdate,
  ...restProps
}: OwnProps) {
  const { onPlay, onPlaying } = restProps;

  const isReadyRef = useRef(false);

  const handleReady = useLastCallback(() => {
    if (!isReadyRef.current) {
      onReady?.();
      isReadyRef.current = true;
    }
  });

  // onPLay: handleBuffering,
  // onLoadedData: handleBuffering,
  // onPlaying: handleBuffering,
  // onLoadStart: handleBuffering, // Needed for Safari to start
  // onPause: handleBuffering, // Needed for Chrome when seeking
  // onTimeUpdate: handleBuffering, // Needed for audio buffering progress
  // onProgress: handleBuffering, // Needed for video buffering progress

  // This is only needed for browsers not allowing autoplay
  const { isBuffered, bufferingHandlers } = useBuffering(true, onTimeUpdate, onBroken);
  const {
    onPLay: handlePlayForBuffering,
    onPlaying: handlePlayingForBuffering,
    ...otherBufferingHandlers
  } = bufferingHandlers;

  useEffectSync(
    ([prevIsBuffered]) => {
      if (!prevIsBuffered) {
        handleReady();
      }
    },
    [isBuffered, handleReady],
  );

  const handlePlaying = useLastCallback(e => {
    handlePlayingForBuffering(e);
    handleReady();
    onPlaying?.(e);
  });

  const handlePlay = useLastCallback(e => {
    handlePlayForBuffering(e);
    onPlay?.(e);
  });

  const mergedOtherBufferingHandlers = useMemo(() => {
    const mergedHandlers: Record<string, AnyFunction> = {};

    Object.keys(otherBufferingHandlers).forEach(keyString => {
      const key = keyString as keyof typeof otherBufferingHandlers;

      mergedHandlers[key] = (event: Event) => {
        restProps[key as keyof typeof restProps]?.(event);
        otherBufferingHandlers[key]?.(event);
      };
    });

    console.log(mergedHandlers);

    return mergedHandlers;
  }, [otherBufferingHandlers, restProps]);

  useVideoCleanup(ref, mergedOtherBufferingHandlers);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <video
      ref={ref}
      autoPlay
      onPlay={handlePlay}
      onPlaying={handlePlaying}
      {...mergedOtherBufferingHandlers}
      {...restProps}
    >
      {children}
    </video>
  );
}

export default memo(Video);
