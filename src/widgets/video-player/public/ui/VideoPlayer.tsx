import React, { lazy, memo, useEffect, useMemo, useRef, useState } from "react";
import {
  BTimeRanges,
  clamp,
  clamp01,
  EKeyboardKey,
  EMediaReadyState,
  IS_TOUCH_ENV,
  isMediaReadyToPlay,
  pauseMedia,
  playMedia,
  round,
  setMediaMute,
  setMediaPlayBackRate,
  setMediaVolume,
  throttle,
} from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useFullscreen from "../hooks/useFullScreen";
import useUnsupportedMedia from "../hooks/useSupportCheck";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import useControlsSignal from "../../private/hooks/useControlsSignal";
import stopEvent from "@/lib/utils/stopEvent";
import useAmbilight from "../hooks/useAmbilight";
import { ObserveFn } from "@/shared/hooks/DOM/useIntersectionObserver";
import VideoPlayerControls from "../../private/ui/VideoPlayerControls";
import "./VideoPlayer.scss";
import { ApiDimensions } from "@/@types/api/types/messages";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import usePictureInPicture from "../hooks/usePictureInPicture";
import buildClassName from "@/shared/lib/buildClassName";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";
import { DEBUG } from "@/lib/config/dev";
import { useBooleanState } from "@/shared/hooks/state";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";

const TopPannel = lazy(() => import("../../private/ui/mobile/TopPannel"));

type OwnProps = {
  ref?: React.RefObject<HTMLVideoElement>;
  closeOnMediaClick?: boolean;
  disableClickActions?: boolean;
  disablePreview?: boolean;
  hidePlayButton?: boolean;
  isAdsMessage?: boolean;
  isViewerOpen?: boolean;
  isGif?: boolean;
  mediaUrl?: string | string[];
  progressPercentage?: number;
  totalFileSize: number;
  playbackSpeed: number;
  audioVolume: number;
  isAudioMuted: boolean;
  isContentProtected?: boolean;
  posterDimensions?: ApiDimensions;
  posterSource?: string;
  allowFullscreen?: boolean;
  observeIntersectionForBottom?: ObserveFn;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;
  onAdsClick?: (triggeredFromMedia?: boolean) => void;
};

const MAX_LOOP_DURATION = 30;
const MIN_READY_STATE = 4;
const REWIND_STEP = 5;

const VideoPlayer: React.FC<OwnProps> = ({
  mediaUrl = "/video_test/Интерстеллар.mp4",
  posterDimensions,
  audioVolume = 1,
  playbackSpeed = 1,
  allowFullscreen = true,
  isAdsMessage,
  disableClickActions,
  isGif,
  isAudioMuted,
  totalFileSize,
  onAdsClick,
}) => {
  const { isMobile } = useAppLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const duration = videoRef.current?.duration || 0;
  const isLooped = isGif || duration <= MAX_LOOP_DURATION;

  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [isAmbient, markAmbientOn, markAmbientOff] = useBooleanState();

  const [currentTime, setCurrentTime] = useStateSignal(0);
  const [volume, setVolume] = useStateSignal(1);
  const [waitingSignal, setWaiting] = useStateSignal(false);
  const [bufferedSingal, setBuffered] = useStateSignal<BufferedRange[]>([]);
  const [controlsSignal, toggleControls, lockControls] = useControlsSignal();

  const [isFullscreen, enterFullscreen, exitFullscreen] =
    useFullscreen(containerRef);

  const handleEnterFullscreen = useStableCallback(async () => {});
  const handleLeaveFullscreen = useStableCallback(async () => {});

  const {
    isSupported: isPictureInPictureSupported,
    isActive: isInPictureInPicture,
    enter: enterPictureInPicture,
  } = usePictureInPicture(videoRef, {
    onEnter: handleEnterFullscreen,
    onLeave: handleLeaveFullscreen,
  });

  const isUnsupported = useUnsupportedMedia(videoRef);
  const isAmbilightDisabled = isFullscreen;

  useAmbilight(videoRef, canvasRef, isAmbilightDisabled);

  const mediaSources = useMemo(() => {
    if (!mediaUrl) return null;
    const urls = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
    return urls.map((url) => <source key={url} src={url} />);
  }, [mediaUrl]);

  const handleTimeUpdate = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const { currentTime: ct, duration: d, readyState } = e.currentTarget;
      const normalizedTime = round(ct);
      const normalizedDuration = round(d);

      if (readyState >= EMediaReadyState.HAVE_ENOUGH_DATA) {
        setWaiting(false);
        setCurrentTime(normalizedTime);
      }

      if (!isLooped && normalizedTime === normalizedDuration) {
        setCurrentTime(0);
        setPlaying(false);
      }
    },
  );

  const handleEnded = useStableCallback(() => {
    setCurrentTime(0);
    setPlaying(!isLooped && isPlaying);
    toggleControls(isLooped);
  });

  const handleSeek = useStableCallback((position: number) => {
    videoRef.current!.currentTime = clamp(position, 0, duration);
    setCurrentTime(position);
  });

  const togglePlayState = useStableCallback(
    async (e: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => {
      e.stopPropagation();
      const video = videoRef.current!;
      setPlaying(!isPlaying);
      return isPlaying ? pauseMedia(video) : await playMedia(video);
    },
  );

  const handleClick = useStableCallback(
    async (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
      if (isAdsMessage) onAdsClick?.(true);
      if (!disableClickActions) await togglePlayState(e);
    },
  );

  const handleTouch = useStableCallback(
    (e: React.TouchEvent<HTMLMediaElement>) => {
      const touch = e.touches[0];
      const videoElement = e.target as HTMLVideoElement;
      requestMeasure(() => {
        const touchX = touch.clientX;
        const action = calculateTouchPosition(videoElement, touchX);
        // Handle touch actions
      });
    },
  );

  const handleVolumeChange = useStableCallback(
    throttle((value: number) => {
      setMediaMute(videoRef.current!, false);
      setMediaVolume(videoRef.current!, value);
      setVolume(value);
    }, 100),
  );

  const handleMuteClick = useStableCallback(() => {
    const video = videoRef.current!;
    const lastVolume = setMediaMute(video, !video.muted);
    setVolume(!video.muted ? lastVolume : 0);
  });

  const handleFullscreenChange = useStableCallback(() => {
    isFullscreen ? exitFullscreen?.() : enterFullscreen?.();
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isUnsupported) return;

    const initializePlayback = async () => {
      try {
        await playMedia(videoElement);
        pauseMedia(videoElement);
      } catch (err) {
        DEBUG && console.log(err);
      }
    };

    if (mediaUrl && !IS_TOUCH_ENV) initializePlayback();
  }, [mediaUrl, isUnsupported]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      const video = videoRef.current!;
      const key = e.key || e.code;

      switch (key) {
        case EKeyboardKey.Space:
        case EKeyboardKey.Enter:
          togglePlayState(e);
          break;
        case EKeyboardKey.ArrowLeft:
          video.currentTime = clamp(
            video.currentTime - REWIND_STEP,
            0,
            duration,
          );
          break;
        case EKeyboardKey.ArrowRight:
          video.currentTime = clamp(
            video.currentTime + REWIND_STEP,
            0,
            duration,
          );
          break;
        case EKeyboardKey.ArrowUp:
        case EKeyboardKey.ArrowDown:
          handleVolumeChange(
            clamp01(volume.value + (key === EKeyboardKey.ArrowUp ? 0.1 : -0.1)),
          );
          break;
        case EKeyboardKey.M:
          handleMuteClick();
          break;
        case EKeyboardKey.F:
          handleFullscreenChange();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [volume, duration, isPlaying]);

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
    [],
  );

  function updateBuffering(e: Event | React.SyntheticEvent<HTMLMediaElement>) {
    const media = e.currentTarget as HTMLMediaElement;
    const ranges = BTimeRanges.getBufferedInfo(media.buffered);
    setBuffered(ranges);
    setReady((current) => current || isMediaReadyToPlay(media));
  }

  const handleVideoEnter = useStableCallback(() => {
    toggleControls(true);
  });

  const handleVideoLeave = useStableCallback(() => {
    toggleControls(!isPlaying);
  });

  const handleVideoMove = useStableCallback(() => {});

  const handlePlaybackRateChange = useStableCallback((value: number) => {
    setMediaPlayBackRate(videoRef.current!, value);
  });

  const handleSeekStart = useStableCallback(() => {});

  const handleSeekEnd = useStableCallback(() => {});

  return (
    <div
      id="media-player"
      className={buildClassName(
        "VideoPlayer",
        isFullscreen && "FullscreenMode",
      )}
      ref={containerRef}
      onMouseMove={!isMobile ? handleVideoMove : undefined}
      onMouseOut={!isMobile ? handleVideoLeave : undefined}
      onMouseOver={!isMobile ? handleVideoEnter : undefined}
    >
      {isMobile && <TopPannel />}

      <video
        id="media-viewer-video"
        ref={videoRef}
        className={buildClassName("Video", IS_TOUCH_ENV && "is-touch-env")}
        controls={false}
        controlsList="nodownload"
        playsInline
        muted={isGif || isAudioMuted}
        {...handlersBuffering}
        onWaiting={() => setWaiting(true)}
        onContextMenu={stopEvent}
        onEnded={handleEnded}
        onClick={!isMobile ? handleClick : undefined}
        onTouchStart={isMobile ? handleTouch : undefined}
        onDoubleClick={!IS_TOUCH_ENV ? handleFullscreenChange : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      >
        {mediaSources}
      </video>

      <VideoPlayerControls
        isPlaying={isPlaying}
        currentTimeSignal={currentTime}
        volumeSignal={volume}
        controlsSignal={controlsSignal}
        duration={duration}
        playbackRate={playbackSpeed}
        isMuted={Boolean(videoRef.current?.muted)}
        bufferedRangesSignal={bufferedSingal}
        isReady={isReady}
        fileSize={totalFileSize}
        waitingSignal={waitingSignal}
        isForceMobileVersion={isMobile}
        isFullscreen={isFullscreen}
        isFullscreenSupported={Boolean(enterFullscreen)}
        isPictureInPictureSupported={isPictureInPictureSupported}
        onPictureInPictureChange={enterPictureInPicture}
        onChangeFullscreen={handleFullscreenChange}
        onVolumeClick={handleMuteClick}
        onVolumeChange={handleVolumeChange}
        onPlaybackRateChange={handlePlaybackRateChange}
        onToggleControls={toggleControls}
        onPlayPause={togglePlayState}
        onSeek={handleSeek}
        onSeekStart={handleSeekStart}
        onSeekEnd={handleSeekEnd}
      />

      <canvas
        data-disabled={isAmbilightDisabled}
        ref={canvasRef}
        className="CinematicLight"
      />
      <div
        ref={bottomRef}
        className="VideoPlayerBottom"
        aria-label="Video Player Bottom"
      />
    </div>
  );
};

const calculateTouchPosition = (
  videoElement: HTMLVideoElement,
  touchX: number,
) => {
  const third = videoElement.clientWidth / 3;
  return touchX < third
    ? "back"
    : touchX < 2 * third
      ? "play-pause"
      : "forward";
};

export default memo(VideoPlayer);
