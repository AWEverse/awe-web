import React, { lazy, memo, useEffect, useRef } from "react";
import {
  clamp,
  clamp01,
  EKeyboardKey,
  EMouseButton,
  IS_TOUCH_ENV,
  pauseMedia,
  playMedia,
} from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useFullscreen from "../hooks/useFullScreen";
import useUnsupportedMedia from "../hooks/useSupportCheck";
import useControlsSignal from "../../private/hooks/useControlsSignal";
import stopEvent from "@/lib/utils/stopEvent";
import useAmbilight from "../hooks/useAmbilight";
import {
  ObserveFn,
  useIsIntersecting,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
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
import parseMediaSources from "../../private/lib/source/parseMediaSources";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import ContextMenu, { useContextMenuHandlers } from "@/entities/context-menu";
import { useVideoBuffering } from "../../private/hooks/useVideoBuffering";
import { useVideoPlayback } from "../../private/hooks/useVideoPlayback";
import { noop } from "@/lib/utils/listener";
import { useTimeLine } from "../../private/hooks/useTimeLine";
import { useTouchControls } from "../../private/hooks/useTouchControls";
import {
  CloseRounded,
  LinkRounded,
  LoopRounded,
  RepeatOutlined,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import ActionButton from "@/shared/ui/ActionButton";

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
  observeIntersectionForBottom?: ObserveFn;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;
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
  onAdsClick,
  observeIntersectionForBottom,
  observeIntersectionForLoading,
  observeIntersectionForPlaying,
}) => {
  const { isMobile } = useAppLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isAmbient, markAmbientOn, markAmbientOff] = useBooleanState();

  const [waitingSignal, setWaiting] = useStateSignal(false);
  const [controlsSignal, toggleControls, lockControls] = useControlsSignal();

  const [isFullscreen, toggleFullscreen] = useFullscreen(containerRef);

  const handleEnterFullscreen = useStableCallback(async () => {});
  const handleLeaveFullscreen = useStableCallback(async () => {});

  const { isReady, bufferedRanges, handlersBuffering } = useVideoBuffering();

  const {
    currentTime,
    duration,
    handleSeek,
    handleTimeUpdate,
    setCurrentTime,
  } = useTimeLine(videoRef);

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
  const isAmbilightDisabled = isFullscreen;

  useAmbilight(videoRef, canvasRef, isAmbilightDisabled);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      const video = videoRef.current!;
      const key = e.key || e.code;

      switch (key) {
        case EKeyboardKey.Space:
        case EKeyboardKey.Enter:
          togglePlayState();
          break;
        case EKeyboardKey.ArrowLeft:
          handleSeek(clamp(video.currentTime - REWIND_STEP, 0, duration));
          break;
        case EKeyboardKey.ArrowRight:
          handleSeek(clamp(video.currentTime + REWIND_STEP, 0, duration));
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
          toggleFullscreen?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [volume, duration, isPlaying]);

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
  } = useContextMenuHandlers(containerRef, false, false, false);

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
  );

  const isIntersectingForPlaying =
    useIsIntersecting(containerRef, observeIntersectionForPlaying) &&
    isIntersectingForLoading;

  useOnIntersect(bottomRef, observeIntersectionForBottom, () => {
    // some logic when bottom is intersection
  });

  return (
    <>
      <div
        id="media-player"
        className={buildClassName(
          "VideoPlayer",
          isFullscreen && "FullscreenMode",
        )}
        ref={containerRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
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
          onClick={!isMobile ? handleVideoClick : undefined}
          onDoubleClick={!IS_TOUCH_ENV ? toggleFullscreen : undefined}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
        >
          {parseMediaSources(mediaUrl)}
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
          waitingSignal={waitingSignal}
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
        />

        <AmbientLight canvasRef={canvasRef} disabled={isAmbilightDisabled} />

        <div
          ref={bottomRef}
          className="VideoPlayerBottom"
          aria-label="Video Player Bottom"
        />
      </div>

      <ContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuAnchor!}
        onClose={handleContextMenuClose}
        withPortal
        menuClassName="p-2"
      >
        <ActionButton size="sm" variant="contained" fullWidth>
          <LoopRounded /> <span>Loop</span>
        </ActionButton>
        <ActionButton size="sm" variant="contained" fullWidth>
          <RepeatOutlined />
          <span>Repeat</span>
        </ActionButton>
        <ActionButton size="sm" variant="contained" fullWidth>
          <LinkRounded /> <span>Copy video url</span>
        </ActionButton>
      </ContextMenu>
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
