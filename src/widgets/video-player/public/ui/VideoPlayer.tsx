import React, { lazy, memo, useEffect, useRef } from "react";
import {
  clamp,
  clamp01,
  EKeyboardKey,
  EMouseButton,
  IS_TOUCH_ENV,
  isBetween,
  pauseMedia,
  playMedia,
} from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useFullscreen from "../../private/hooks/useFullScreen";
import useUnsupportedMedia from "../../private/hooks/useSupportCheck";
import useControlsSignal from "../../private/hooks/useControlsSignal";
import stopEvent from "@/lib/utils/stopEvent";
import useAmbilight from "../../private/hooks/useAmbilight";
import {
  useIsIntersecting,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import VideoPlayerControls from "../../private/ui/VideoPlayerControls";
import "./VideoPlayer.scss";
import { ApiDimensions } from "@/@types/api/types/messages";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import usePictureInPicture from "../../private/hooks/usePictureInPicture";
import buildClassName from "@/shared/lib/buildClassName";
import useStateSignal from "@/lib/hooks/signals/useStateSignal";
import { DEBUG } from "@/lib/config/dev";
import { useBooleanState, useTriggerReRender } from "@/shared/hooks/state";
import parseMediaSources from "../../private/lib/source/parseMediaSources";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import { useContextMenuHandlers } from "@/entities/context-menu";
import { useVideoBuffering } from "../../private/hooks/useVideoBuffering";
import { useVideoPlayback } from "../../private/hooks/useVideoPlayback";
import { noop } from "@/lib/utils/listener";
import { useTimeLine } from "../../private/hooks/useTimeLine";
import VideoPlayerContextMenu from "../../private/ui/VideoPlayerContextMenu";
import { useScrollProvider } from "@/shared/context";
import useKeyHandler from "../../private/hooks/useKeyHandler";
import { useThrottledFunction } from "@/shared/hooks/shedulers";
import { useTouchControls } from "../../private/hooks/useTouchControls";

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
  mediaUrl?: string;
  progressPercentage?: number;
  totalFileSize: number;
  playbackSpeed: number;
  audioVolume: number;
  isAudioMuted: boolean;
  isContentProtected?: boolean;
  posterDimensions?: ApiDimensions;
  posterSource?: string;
  allowFullscreen?: boolean;
  onAdsClick?: (triggeredFromMedia?: boolean) => void;
};

const MAX_LOOP_DURATION = 30;
const REWIND_STEP = 5;

const VideoPlayer: React.FC<OwnProps> = ({
  mediaUrl = "/video_test/Интерстеллар.mp4",
  playbackSpeed = 1,
  isAdsMessage,
  disableClickActions,
  isGif,
  isAudioMuted,
  totalFileSize,
  posterSource,
  onAdsClick,
}) => {
  const { isMobile } = useAppLayout();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  const [reflows, forceReflow] = useTriggerReRender();

  const {
    observeIntersectionForReading,
    observeIntersectionForLoading,
    observeIntersectionForPlaying,
  } = useScrollProvider();

  const getVideoElement = useStableCallback(() => {
    const videoElement = videoRef?.current;

    if (!videoElement) {
      if (reflows > 3) {
        throw new Error("Video element doesn't exist!");
      }
      forceReflow();
    }

    return videoElement!;
  });

  const [isAmbient, markAmbientOn, markAmbientOff] = useBooleanState(true);

  const [waitingSignal, setWaiting] = useStateSignal(false);
  const [controlsSignal, toggleControls, lockControls] = useControlsSignal();

  const [isFullscreen, toggleFullscreen] = useFullscreen(containerRef);

  const handleEnterFullscreen = useStableCallback(async () => {});
  const handleLeaveFullscreen = useStableCallback(async () => {});

  const { isReady, bufferedRanges, handlersBuffering } = useVideoBuffering();

  const { currentTime, duration, handleSeek, handleTimeUpdate } =
    useTimeLine(videoRef);

  const isLooped = isGif || duration <= MAX_LOOP_DURATION;

  const {
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    handlePlay,
    handlePause,
    togglePlayState,
    handleVolumeChange,
    handleMuteClick,
    handlePlaybackRateChange,
  } = useVideoPlayback(videoRef);

  const {
    isSupported: isPictureInPictureSupported,
    enter: enterPictureInPicture,
  } = usePictureInPicture(videoRef, {
    onEnter: handleEnterFullscreen,
    onLeave: handleLeaveFullscreen,
  });

  const isUnsupported = useUnsupportedMedia(videoRef);
  const isAmbilightDisabled = isAmbient && isFullscreen;

  useAmbilight(videoRef, canvasRef, isAmbilightDisabled);

  const toggleAmbientLight = useStableCallback(() => {
    !isAmbient ? markAmbientOn() : markAmbientOff();
  });

  const handleEnded = useStableCallback(() => {
    if (!isLooped && isPlaying) handlePlay();
    toggleControls(isLooped);
  });

  const handleVideoClick = useStableCallback(
    async (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
      if (isAdsMessage) onAdsClick?.(true);
      if (!disableClickActions) await togglePlayState();
    },
  );

  useTouchControls(videoRef, {
    onLeftZone: () =>
      handleSeek(clamp(currentTime.value - REWIND_STEP, 0, duration)),
    onRightZone: () =>
      handleSeek(clamp(currentTime.value + REWIND_STEP, 0, duration)),
    onCenterZone: togglePlayState,
    zoneRatios: [0.2, 0.6, 0.2],
    debounceTime: 500,
    enableDoubleTap: true,
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

  useKeyHandler({
    Space: () => togglePlayState(),
    Enter: () => togglePlayState(),
    ArrowLeft: () => {
      const video = getVideoElement();
      handleSeek(clamp(video.currentTime - REWIND_STEP, 0, duration));
    },
    ArrowRight: () => {
      const video = getVideoElement();
      handleSeek(clamp(video.currentTime + REWIND_STEP, 0, duration));
    },
    ArrowUp: () => handleVolumeChange(clamp01(volume.value + 0.1)),
    ArrowDown: () => handleVolumeChange(clamp01(volume.value - 0.1)),
    KeyM: () => handleMuteClick(),
    KeyF: () => toggleFullscreen?.(),
  });

  const handleVideoEnter = useStableCallback(() => toggleControls(true));
  const handleVideoLeave = useStableCallback(() => toggleControls(!isPlaying));

  const handleVideoMove = useStableCallback(() => {});

  const handleSeekStart = useStableCallback(() => {});

  const handleSeekEnd = useStableCallback(() => {});

  const {
    isContextMenuOpen,
    contextMenuAnchor,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
  } = useContextMenuHandlers({
    elementRef: containerRef,
    isMenuDisabled: false,
    shouldDisableOnLink: true,
    shouldDisableOnLongTap: false,
    shouldDisablePropagation: true,
  });

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === EMouseButton.Secondary) {
        handleBeforeContextMenu(e);
      }

      if (e.type === "mousedown" && e.button !== EMouseButton.Main) {
        return;
      }
    },
  );

  const isIntersectingForLoading = useIsIntersecting(
    containerRef,
    observeIntersectionForLoading,
    (entry) => {
      const videoEl = getVideoElement();

      if (isBetween(entry.intersectionRatio, 0.9, 1.0)) {
        playMedia(videoEl);
      } else {
        pauseMedia(videoEl);
      }
    },
  );

  screen.orientation.lock();

  const isIntersectingForPlaying =
    useIsIntersecting(containerRef, observeIntersectionForPlaying) &&
    isIntersectingForLoading;

  useOnIntersect(readingRef, observeIntersectionForReading, (entry) => {
    const videoEl = getVideoElement();

    if (entry.isIntersecting && !videoEl.paused) {
      playMedia(videoEl);
    } else {
      pauseMedia(videoEl);
    }
  });

  return (
    <>
      <div
        id="media-player"
        className={buildClassName(
          "VideoPlayer",
          isFullscreen && "FullScreenMode",
        )}
        ref={containerRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={!isMobile ? handleVideoMove : undefined}
        onMouseOut={!isMobile ? handleVideoLeave : undefined}
        onMouseOver={!isMobile ? handleVideoEnter : undefined}
      >
        {isMobile && <TopPannel />}

        <video
          id="media-viewer-video"
          title="High-Quality 1080p Video Player"
          poster={
            posterSource ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxzXOOafoY2e2DZ3UKpAQ2Gz6S6bOCeab5Dg&s"
          }
          ref={videoRef}
          className={buildClassName("Video", IS_TOUCH_ENV && "is-touch-env")}
          controls={false}
          controlsList="nodownload"
          playsInline
          muted={isGif || isAudioMuted}
          aria-hidden={false}
          role="video"
          autoPlay={false}
          {...handlersBuffering}
          onWaiting={() => setWaiting(true)}
          onContextMenu={handleContextMenu}
          onEnded={handleEnded}
          onClick={!isMobile ? handleVideoClick : undefined}
          onDoubleClick={!IS_TOUCH_ENV ? toggleFullscreen : undefined}
          onTimeUpdate={handleTimeUpdate}
        >
          {parseMediaSources({
            src: mediaUrl,
          })}
        </video>

        <VideoPlayerControls
          isPlaying={isPlaying}
          currentTimeSignal={currentTime}
          volumeSignal={volume}
          controlsSignal={controlsSignal}
          duration={duration}
          playbackRate={playbackRate}
          isMuted={isMuted}
          bufferedRangesSignal={bufferedRanges}
          isReady={isReady}
          fileSize={totalFileSize}
          isForceMobileVersion={isMobile}
          isFullscreen={isFullscreen}
          isFullscreenSupported={Boolean(toggleFullscreen)}
          isPictureInPictureSupported={isPictureInPictureSupported}
          onPictureInPictureChange={enterPictureInPicture}
          onChangeFullscreen={toggleFullscreen || noop}
          onVolumeClick={handleMuteClick}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleControls={toggleControls}
          onPlayPause={togglePlayState}
          onSeek={handleSeek}
          onSeekStart={handleSeekStart}
          onSeekEnd={handleSeekEnd}
          onAmbientModeClick={toggleAmbientLight}
        />

        <AmbientLight canvasRef={canvasRef} disabled={isAmbilightDisabled} />

        <div
          ref={readingRef}
          className="VideoPlayerBottom"
          aria-label="Video Player Bottom"
        />
      </div>

      <VideoPlayerContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
        withPortal
        menuClassName="p-2"
      />
    </>
  );
};

const AmbientLight = memo(
  ({
    canvasRef,
    disabled,
  }: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    disabled?: boolean;
  }) => (
    <canvas
      ref={canvasRef}
      className="CinematicLight"
      data-disabled={disabled}
    />
  ),
);

export default memo(VideoPlayer);
