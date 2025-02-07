import { useRefInstead, useStableCallback } from "@/shared/hooks/base";
import useBuffering, {
  BufferingPair,
  HTMLMediaBufferedEvent,
} from "@/lib/hooks/ui/useBuffering";
import { useRef, useMemo, memo } from "react";
import useEffectSync from "../hooks/effects/useEffectSync";
import useVideoCleanup from "../hooks/DOM/useVideoCleanup";

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

const defaultVideoStyles: React.CSSProperties = {
  objectFit: "cover",
  display: "block",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
};

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
  style: userStyle,
  ...restProps
}: OwnProps) {
  const videoRef = useRefInstead<HTMLVideoElement>(ref);
  const isReadyRef = useRef(false);

  // Merge default styles with user-provided styles
  const mergedStyle = useMemo(
    () => ({
      ...defaultVideoStyles,
      ...userStyle,
    }),
    [userStyle],
  );

  const handleReady = useStableCallback(() => {
    if (!isReadyRef.current) {
      onReady?.();
      isReadyRef.current = true;
    }
  });

  const { isBuffered, bufferingHandlers } = useBuffering(
    true,
    onTimeUpdate,
    onBroken,
  );
  const { onPlaying: handlePlayingForBuffering, ...otherBufferingHandlers } =
    bufferingHandlers;

  useEffectSync(
    ([prevIsBuffered]) => {
      if (prevIsBuffered === undefined) return;
      handleReady();
    },
    [isBuffered, handleReady],
  );

  const handlePlaying = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      handlePlayingForBuffering(e);
      handleReady();
      restProps.onPlaying?.(e);
    },
  );

  const handlePlay = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      restProps.onPlay?.(e);
    },
  );

  const mergedOtherBufferingHandlers = useMemo(() => {
    const handlers: BufferingPair = {};

    Object.keys(otherBufferingHandlers).forEach((keyString) => {
      const key = keyString as keyof typeof otherBufferingHandlers;

      handlers[key] = (e: HTMLMediaBufferedEvent) => {
        restProps[key as keyof typeof restProps]?.(e);
        otherBufferingHandlers[key]?.(e);
      };
    });

    return handlers;
  }, [otherBufferingHandlers, restProps]);

  useVideoCleanup(videoRef, mergedOtherBufferingHandlers);

  return (
    <video
      ref={videoRef}
      onPlay={handlePlay}
      onPlaying={handlePlaying}
      style={mergedStyle}
      playsInline
      preload="auto"
      {...mergedOtherBufferingHandlers}
      {...restProps}
    >
      {children}
    </video>
  );
}

export default memo(Video);
