import useEffectSync from '@/lib/hooks/effects/useEffectSync';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useBuffering, {
  BufferingEvent,
  BufferingPair,
  HTMLMediaBufferedEvent,
} from '@/lib/hooks/ui/useBuffering';
import { useRef, useMemo, memo } from 'react';
import useVideoCleanup from '../hooks/useVideoCleanup';
import useRefInstead from '@/lib/hooks/state/useRefInstead';

type VideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type OwnProps = {
  ref?: React.RefObject<HTMLVideoElement | null>;
  isPriority?: boolean;
  canPlay: boolean;
  children?: React.ReactNode;
  onReady?: NoneToVoidFunction;
  onBroken?: NoneToVoidFunction;
} & VideoProps;

/**
 * `Video` component with customizable properties.
 *
 * Props:
 *
 * | **Property**               | **Example**                                          | **Type**                            | **Status**        |
 * |----------------------------|-----------------------------------------------------|-------------------------------------|-------------------|
 * | `ref`                      | `ref={videoRef}`                                    | `React.RefObject<HTMLVideoElement>` | Optional          |
 * | `isPriority`               | `isPriority={true}`                                 | `boolean`                           | Optional          |
 * | `canPlay`                  | `canPlay="auto"`                                    | `boolean or string`                  | Optional          |
 * | `children`                 | `children={<SomeContent />}`                        | `ReactNode`                         | Optional          |
 * | `onReady`                  | `onReady={() => console.log("Video is ready!")}`    | `() => void`                        | Optional          |
 * | `onBroken`                 | `onBroken={() => console.log("Video failed!")}`     | `() => void`                        | Optional          |
 * | `onTimeUpdate`             | `onTimeUpdate={(e) => console.log(e.currentTime)}`  | `(event: React.SyntheticEvent) => void` | Optional        |
 * | `...restProps`             | `...restProps`                                      | `React.VideoHTMLAttributes<HTMLVideoElement>` | Optional    |
 */
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
      if (prevIsBuffered === undefined) {
        return;
      }

      handleReady();
    },
    [isBuffered, handleReady],
  );

  const handlePlaying = useLastCallback(e => {
    handlePlayingForBuffering(e);
    handleReady();
    restProps.onPlaying?.(e);
  });

  const handlePlay = useLastCallback(e => {
    handlePlayForBuffering(e);
    restProps.onPlay?.(e);
  });

  const mergedOtherBufferingHandlers = useMemo(() => {
    const mergedHandlers: BufferingPair = {};

    Object.keys(otherBufferingHandlers).forEach(keyString => {
      const key = keyString as keyof typeof otherBufferingHandlers;

      mergedHandlers[key] = (e: HTMLMediaBufferedEvent) => {
        restProps[key as keyof typeof restProps]?.(e);
        otherBufferingHandlers[key]?.(e);
      };
    });

    return mergedHandlers;
  }, [otherBufferingHandlers, restProps]);

  // TODO: Fix cleanup hook
  // Something went wrong with that hook, actually it immediately unmounts the video after the first render
  // useVideoCleanup(videoRef, mergedOtherBufferingHandlers);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <video
      ref={videoRef}
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
