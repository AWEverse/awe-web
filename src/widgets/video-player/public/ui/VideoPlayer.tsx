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
import useAmbilight from "../../private/hooks/useAmbilight";
import {
  useIsIntersecting,
  useOnIntersect,
} from "@/shared/hooks/DOM/useIntersectionObserver";
import VideoPlayerControls from "../../private/ui/VideoPlayerControls";
import "./VideoPlayer.scss";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import usePictureInPicture from "../../private/hooks/usePictureInPicture";
import buildClassName from "@/shared/lib/buildClassName";
import { useBooleanState, useTriggerReRender } from "@/shared/hooks/state";
import parseMediaSources from "../../private/lib/source/parseMediaSources";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import { useContextMenuHandlers } from "@/entities/context-menu";
import { useVideoPlayback } from "../../private/hooks/useVideoPlayback";
import { noop } from "@/lib/utils/listener";
import { useTimeLine } from "../../private/hooks/useTimeLine";
import VideoPlayerContextMenu from "../../private/ui/context-menu/VideoPlayerContextMenu";
import { useScrollProvider } from "@/shared/context";
import useKeyHandler from "../../private/hooks/useKeyHandler";
import { useTouchControls } from "../../private/hooks/useTouchControls";
import AmbientLight from "./AmbientLight";

const TopPannel = lazy(() => import("../../private/ui/mobile/TopPannel"));

type OwnProps = {
  mediaUrl?: string;
  totalFileSize: number;
  playbackSpeed: number;
  isAdsMessage?: boolean;
  isGif?: boolean;
  isAudioMuted: boolean;
  posterSource?: string;
  onAdsClick?: (triggeredFromMedia?: boolean) => void;
};

const MAX_LOOP_DURATION = 30;
const REWIND_STEP = 5;

const VideoPlayer: React.FC<OwnProps> = ({
  mediaUrl = "/video_test/Интерстеллар.mp4",
  isAdsMessage,
  isGif,
  isAudioMuted,
  totalFileSize,
  posterSource,
  onAdsClick,
}) => {
  const { isMobile } = useAppLayout();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  const [reflows, forceReflow] = useTriggerReRender();

  const { observeIntersectionForReading, observeIntersectionForLoading } =
    useScrollProvider();

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
  const [controlsSignal, toggleControls] = useControlsSignal();
  const [isFullscreen, toggleFullscreen] = useFullscreen(containerRef);

  const { currentTime, duration, handleSeek } = useTimeLine(videoRef);
  const isLooped = isGif || duration <= MAX_LOOP_DURATION;

  const {
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    togglePlayState,
    handleVolumeChange,
    handleMuteClick,
    handlePlaybackRateChange,
  } = useVideoPlayback(videoRef);

  const {
    isSupported: isPictureInPictureSupported,
    enter: enterPictureInPicture,
  } = usePictureInPicture(videoRef, {});

  const isUnsupported = useUnsupportedMedia(videoRef);
  const isAmbilightDisabled = isAmbient && isFullscreen;

  useAmbilight(
    videoRef,
    canvasRef,
    {
      fps: 30,
      intensity: 0.8,
      drawMode: "blur",
      blurRadius: 20,
      edgeThickness: 0.15,
    },
    isAmbilightDisabled,
  );

  const toggleAmbientLight = useStableCallback(() => {
    !isAmbient ? markAmbientOn() : markAmbientOff();
  });

  const handleEnded = useStableCallback(() => {
    if (!isLooped && isPlaying) {
      togglePlayState();
    }
    toggleControls(isLooped);
  });

  const handleVideoClick = useStableCallback(async () => {
    if (isAdsMessage) onAdsClick?.(true);
    await togglePlayState();
  });

  useTouchControls(videoRef, {
    onLeftZone: () =>
      handleSeek(
        clamp(
          currentTime.value + (currentTime.value - REWIND_STEP),
          0,
          duration,
        ),
      ),
    onRightZone: () =>
      handleSeek(
        clamp(
          currentTime.value + (currentTime.value + REWIND_STEP),
          0,
          duration,
        ),
      ),
    onCenterZone: togglePlayState,
    zoneRatios: [0.2, 0.6, 0.2],
    debounceTime: 500,
    enableDoubleTap: true,
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isUnsupported) return;
    if (mediaUrl && !IS_TOUCH_ENV) {
      (async () => {
        try {
          await playMedia(videoElement);
          pauseMedia(videoElement);
        } catch (err) {
          // DEBUG && console.log(err);
        }
      })();
    }
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

  useIsIntersecting(containerRef, observeIntersectionForLoading, (entry) => {
    const videoEl = getVideoElement();
    if (isBetween(entry.intersectionRatio, 0.9, 1.0)) {
      playMedia(videoEl);
    } else {
      pauseMedia(videoEl);
    }
  });

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
          preload="auto"
          autoPlay={false}
          onContextMenu={handleContextMenu}
          onEnded={handleEnded}
          onClick={!isMobile ? handleVideoClick : undefined}
          onDoubleClick={!IS_TOUCH_ENV ? toggleFullscreen : undefined}
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
          isReady={true}
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
          onAmbientModeClick={toggleAmbientLight}
          onSeekStart={function (): void {
            throw new Error("Function not implemented.");
          }}
          onSeekEnd={function (): void {
            throw new Error("Function not implemented.");
          }}
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
      />
    </>
  );
};

export default memo(VideoPlayer);
