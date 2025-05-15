import { BufferingProvider } from "@/lib/hooks/ui/useBufferingObserver";
import { useRefInstead, useStableCallback } from "@/shared/hooks/base";
import useBuffering from "@/lib/hooks/ui/useBuffering";
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
  onReady?: () => void;
  onBroken?: (errMessage?: string) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
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

  const {
    isBuffered,
    bufferingHandlers: {
      onPlaying: handlePlayingForBuffering,
      ...otherBufferingHandlers
    },
  } = useBuffering({
    mediaRef: videoRef,
    noInitiallyBuffered: true,
    onTimeUpdate: onTimeUpdate
      ? (e) => onTimeUpdate(e as React.SyntheticEvent<HTMLVideoElement, Event>)
      : undefined,
    onBroken,
  });

  useEffectSync(
    ([prevIsBuffered]) => {
      if (prevIsBuffered === undefined) return;
      handleReady();
    },
    [isBuffered, handleReady],
  );

  const handlePlaying = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      handlePlayingForBuffering?.(e);
      handleReady();
      restProps.onPlaying?.(e);
    },
  );

  const handlePlay = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      restProps.onPlay?.(e);
    },
  );

  const buffHandlers = useMemo(() => {
    const handlers: Record<
      string,
      (e: React.SyntheticEvent<HTMLVideoElement>) => void
    > = {};

    Object.entries(otherBufferingHandlers).forEach(([key, handler]) => {
      handlers[key] = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        (restProps[key as keyof typeof restProps] as any)?.(e);
        handler(e);
      };
    });

    return handlers;
  }, [otherBufferingHandlers, restProps]);

  useVideoCleanup(videoRef, buffHandlers);

  // Convert onTimeUpdate for BufferingProvider
  const handleTimeUpdate = useStableCallback(() => {
    if (videoRef.current) {
      const event = new Event(
        "timeupdate",
      ) as unknown as React.SyntheticEvent<HTMLVideoElement>;
      event.currentTarget = videoRef.current;
      onTimeUpdate?.(event);
    }
  });

  return (
    <BufferingProvider
      mediaRef={videoRef}
      onTimeUpdate={handleTimeUpdate}
      onBroken={onBroken}
    >
      <video
        ref={videoRef}
        onPlay={handlePlay}
        onPlaying={handlePlaying}
        style={mergedStyle}
        playsInline
        preload="auto"
        {...buffHandlers}
        {...restProps}
      >
        {children}
      </video>
    </BufferingProvider>
  );
}

export default memo(Video);
