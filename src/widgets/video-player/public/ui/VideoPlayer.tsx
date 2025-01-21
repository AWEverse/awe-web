import {
  lazy,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clamp,
  clamp01,
  debounce,
  EKeyboardKey,
  EMediaReadyState,
  IS_TOUCH_ENV,
  isMediaReadyToPlay,
  pauseMedia,
  playMedia,
  setMediaMute,
  setMediaPlayBackRate,
  setMediaVolume,
  throttle,
} from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useFullscreen from "../hooks/useFullScreen";
import useUnsupportedMedia from "../hooks/useSupportCheck";
import { BufferedRange, getTimeRanges } from "@/lib/hooks/ui/useBuffering";
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

  posterDimensions?: ApiDimensions; // width and height
  posterSource?: string;
  allowFullscreen?: boolean;

  observeIntersectionForBottom?: ObserveFn;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;

  onAdsClick?: (triggeredFromMedia?: boolean) => void;
};

const MAX_LOOP_DURATION = 30; // Seconds
const MIN_READY_STATE = 4;
const REWIND_STEP = 5; // Seconds

const useTimeUpdateInterval = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  intervalInSeconds: number,
) => {
  const [timeUpdateLoop, setTimeUpdateLoop] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    if (timeUpdateLoop) {
      clearInterval(timeUpdateLoop);
    }

    if (intervalInSeconds > 0 && videoRef.current) {
      // Немедленное обновление времени
      const videoElement = videoRef.current;
      videoElement.dispatchEvent(new Event("timeupdate"));

      // Запуск интервала обновления времени
      const newInterval = setInterval(() => {
        videoElement.dispatchEvent(new Event("timeupdate"));
      }, intervalInSeconds * 1000);

      setTimeUpdateLoop(newInterval);

      // Очистка интервала при размонтировании
      return () => {
        if (newInterval) {
          clearInterval(newInterval);
        }
      };
    }
  }, [intervalInSeconds, videoRef, timeUpdateLoop]);

  return timeUpdateLoop;
};

const VideoPlayer: React.FC<OwnProps> = ({
  mediaUrl = "public\\video_test\\got.mp4",
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

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef(1);

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

  const [isFullscreen, enterFullscreen, exitFullscreen] = useFullscreen(
    containerRef,
    setPlaying,
  );

  const handleEnterFullscreen = useStableCallback(() => {});

  const handleLeaveFullscreen = useStableCallback(() => {});

  const [
    isPictureInPictureSupported,
    enterPictureInPicture,
    isInPictureInPicture,
  ] = usePictureInPicture(
    videoRef,
    handleEnterFullscreen,
    handleLeaveFullscreen,
  );

  // const { isReady, isBuffered, bufferedRanges, bufferingHandlers, bufferedProgress } = useBuffering();
  // useVideoCleanup(videoRef, bufferingHandlers);

  const isUnsupported = useUnsupportedMedia(videoRef);

  useAmbilight(videoRef, canvasRef);

  const handleTimeUpdate = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const { currentTime, duration, readyState } = e.currentTarget;

      if (readyState >= EMediaReadyState.HAVE_ENOUGH_DATA) {
        setWaiting(false);
        setCurrentTime(currentTime);
      }

      if (!isLooped && currentTime === duration) {
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

  const handleSeekStart = useStableCallback(() => {});

  const handleSeekEnd = useStableCallback(() => {});

  const togglePlayState = useStableCallback(
    async (e: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => {
      e.stopPropagation();

      const video = videoRef.current!;
      setPlaying(!isPlaying);

      isPlaying ? pauseMedia(video) : await playMedia(video);
    },
  );

  const handleClick = useStableCallback(
    async (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
      if (isAdsMessage) {
        onAdsClick?.(true);
      }

      if (disableClickActions) {
        return;
      }

      await togglePlayState(e);
    },
  );

  const handleTouch = useStableCallback(
    (e: React.TouchEvent<HTMLMediaElement>) => {
      const touch = e.touches[0];
      const videoElement = e.target as HTMLVideoElement;

      // Чтение данных из DOM через fastdom
      requestMeasure(() => {
        const touchX = touch.clientX;

        // Расчет положения касания
        const action = calculateTouchPosition(videoElement, touchX);

        switch (action) {
          case "back":
            break;
          case "play-pause":
            break;
          case "forward":
            break;
        }
      });
    },
  );

  // Example handlers
  const handleBack = useStableCallback(() => {
    console.log("Navigating back...");
  });

  const handleNext = useStableCallback(() => {
    console.log("Navigating next...");
  });

  const handleVideoEnter = useStableCallback(() => {
    toggleControls(true);
  });

  const handleVideoLeave = useStableCallback(() => {
    toggleControls(!isPlaying);
  });

  const handleVideoMove = useStableCallback(() => {});

  const handleVolumeChange = useStableCallback(
    throttle((value: number) => {
      setMediaVolume(videoRef.current!, value);
      setVolume(value);
      volumeRef.current = value;
    }, 100),
  );

  const handleMuteClick = useStableCallback(() => {
    const video = videoRef.current!;
    setMediaMute(video, !video.muted);
    setVolume(!video.muted ? volumeRef.current : 0);
  });

  const handlePlaybackRateChange = useStableCallback((value: number) => {
    setMediaPlayBackRate(videoRef.current!, value);
  });

  const handleFullscreenChange = useStableCallback(() => {
    if (isFullscreen) {
      exitFullscreen?.();
    } else {
      enterFullscreen?.();
    }
  });

  const handlePlay = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setPlaying(true);
    },
  );

  const handlePauseChange = useStableCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setPlaying(false);
    },
  );

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (isUnsupported) {
      pauseMedia(videoElement);
    } else if (mediaUrl && !IS_TOUCH_ENV) {
      // Chrome does not automatically start playing when `url` becomes available (even with `autoPlay`),
      // so we force it here. Contrary, iOS does not allow to call `play` without mouse event,
      // so we need to use `autoPlay` instead to allow pre-buffering.
      playMedia(videoElement)
        .then(() => {
          pauseMedia(videoElement);
        })
        .catch((err) => {
          DEBUG && console.log(err);
        });
    }
  }, [mediaUrl, isUnsupported]);

  useEffect(() => {
    const rewind = (dir: number) => {
      const video = videoRef.current!;

      const newTime = clamp(
        video.currentTime + dir * REWIND_STEP,
        0,
        video.duration,
      );

      if (Number.isFinite(newTime)) {
        video.currentTime = newTime;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInPictureInPicture) {
        return;
      }

      const key = e.key || e.code;

      switch (key) {
        case EKeyboardKey.Space:
        case EKeyboardKey.Enter:
          e.preventDefault();
          togglePlayState(e);
          break;
        case EKeyboardKey.ArrowLeft:
        case "Left": // IE/Edge specific
          e.preventDefault();
          rewind(-1);
          break;
        case EKeyboardKey.ArrowRight:
        case "Right": // IE/Edge specific
          e.preventDefault();
          rewind(1);
          break;
        case EKeyboardKey.ArrowUp:
        case EKeyboardKey.ArrowDown:
          e.preventDefault();
          handleVolumeChange(
            clamp01(
              volume.value + (e.key === EKeyboardKey.ArrowUp ? 0.1 : -0.1),
            ),
          );
          break;
        case EKeyboardKey.M:
          e.preventDefault();
          handleMuteClick();
          break;
        case EKeyboardKey.F:
          e.preventDefault();
          handleFullscreenChange();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlayState, isFullscreen, isInPictureInPicture]);

  const shouldToggleControls = !IS_TOUCH_ENV && !isMobile;

  // useEffect(() => {
  //   console.log('bufferedRanges changed:', bufferedRanges);
  // }, [bufferedRanges]);

  // useEffect(() => {
  //   console.log('bufferedProgress changed:', bufferedProgress);
  // }, [bufferedProgress]);

  // useEffect(() => {
  //   console.log('isBuffered changed:', isBuffered);
  // }, [isBuffered]);

  // useEffect(() => {
  //   console.log('isReady changed:', isReady);
  // }, [isReady]);

  const handlersBuffering = useMemo(() => {
    const handleBuffering = (
      e: Event | React.SyntheticEvent<HTMLMediaElement>,
    ) => {
      const media = e.currentTarget as HTMLMediaElement;
      const ranges = getTimeRanges(media.buffered, media.duration);

      setBuffered(ranges);
      setReady((current) => current || isMediaReadyToPlay(media));
    };

    return {
      onPlay: handleBuffering,
      onLoadedData: handleBuffering,
      onPlaying: handleBuffering,
      onLoadStart: handleBuffering, // Needed for Safari to start
      onPause: handleBuffering, // Needed for Chrome when seeking
      onTimeUpdate: handleBuffering, // Needed for audio buffering progress
      onProgress: handleBuffering, // Needed for video buffering progress
    };
  }, [duration, setBuffered]);

  return (
    <div
      id="media-player"
      className={buildClassName(
        "VideoPlayer",
        isFullscreen && "FullscreenMode",
      )}
      ref={containerRef}
      onMouseMove={shouldToggleControls ? handleVideoMove : undefined}
      onMouseOut={shouldToggleControls ? handleVideoLeave : undefined}
      onMouseOver={shouldToggleControls ? handleVideoEnter : undefined}
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
        onTouchStart={isMobile && IS_TOUCH_ENV ? handleTouch : undefined}
        onDoubleClick={!IS_TOUCH_ENV ? handleFullscreenChange : undefined}
        onPlay={handlePlay}
        onPause={handlePauseChange}
        onTimeUpdate={handleTimeUpdate}
        src={mediaUrl as string}
      />

      <VideoPlayerControls
        // Playback Control
        isPlaying={isPlaying}
        currentTimeSignal={currentTime}
        volumeSignal={volume}
        controlsSignal={controlsSignal}
        duration={duration}
        playbackRate={playbackSpeed}
        isMuted={Boolean(videoRef.current?.muted)}
        // Buffered Media Info
        bufferedRangesSignal={bufferedSingal}
        isReady={isReady}
        fileSize={totalFileSize}
        // UI State
        waitingSignal={waitingSignal}
        isForceMobileVersion={isMobile}
        isFullscreen={isFullscreen}
        isFullscreenSupported={Boolean(enterFullscreen)}
        isPictureInPictureSupported={isPictureInPictureSupported}
        // Event Handlers
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

      <canvas id="ambilight" ref={canvasRef} className={"CinematicLight"} />
      <div
        ref={bottomRef}
        className="VideoPlayerBottom"
        role="contentinfo"
        aria-label="Video Player Bottom"
      />
    </div>
  );
};

const calculateTouchPosition = (
  videoElement: HTMLVideoElement,
  touchX: number,
) => {
  const videoWidth = videoElement.clientWidth;
  const thirdOfScreen = videoWidth / 3;

  if (touchX < thirdOfScreen) {
    return "back";
  } else if (touchX >= thirdOfScreen && touchX <= 2 * thirdOfScreen) {
    return "play-pause";
  } else {
    return "forward";
  }
};

export default memo(VideoPlayer);
