import { ApiDimensions } from '@/@types/api/types/messages';
import {
  clamp,
  IS_IOS,
  IS_TOUCH_ENV,
  pauseMedia,
  playMedia,
  setMediaMute,
  setMediaPlayBackRate,
  setMediaVolume,
  throttle,
} from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { ObserveFn } from '@/lib/hooks/sensors/useIntersectionObserver';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { memo, useEffect, useRef, useState } from 'react';
import useFullscreen from '../hooks/useFullScreen';
import useAppLayout from '@/lib/hooks/ui/useAppLayout';
import useUnsupportedMedia from '../hooks/useSupportCheck';
import Video from '@/shared/ui/Video';

import s from './VideoPlayer.module.scss';
import VideoPlayerControls from './VideoPlayerControls';
import useContextSignal from '../../private/hooks/useContextSignal';
import useBuffering from '@/lib/hooks/ui/useBuffering';
import useControlsSignal from '../../private/hooks/useControlsSignal';
import stopEvent from '@/lib/utils/stopEvent';
import useAmbilight from '../hooks/useAmbilight';

type OwnProps = {
  ref?: React.RefObject<HTMLVideoElement | null>;
  closeOnMediaClick?: boolean;
  disableClickActions?: boolean;
  disablePreview?: boolean;
  hidePlayButton?: boolean;
  isAdsMessage?: boolean;
  isViewerOpen?: boolean;

  mediaUrl?: string | string[];
  progressPercentage?: number;
  totalFileSize: number;
  playbackSpeed: number;
  audioVolume: number;
  isAudioMuted: boolean;
  isContentProtected?: boolean;

  posterDimensions?: ApiDimensions; // width and height
  posterSource?: string;

  observeIntersectionForBottom?: ObserveFn;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;

  onAdsClick?: (triggeredFromMedia?: boolean) => void;

  forceMobileView?: boolean;
};

const MAX_LOOP_DURATION = 30; // Seconds
const MIN_READY_STATE = 4;
const REWIND_STEP = 5; // Seconds

const VideoPlayer: React.FC<OwnProps> = ({
  mediaUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  posterDimensions,
  forceMobileView,
  audioVolume = 1,
  playbackSpeed = 1,
  isAdsMessage,
  disableClickActions,
  onAdsClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const duration = videoRef.current?.duration || 0;

  const [isPlaying, setPlaying] = useState(!IS_TOUCH_ENV || !IS_IOS);

  const [currentTime, setCurrentTime] = useContextSignal(0);
  const [waitingSignal, setWaiting] = useContextSignal(false);
  const [isControlsVisible, toggleControls, lockControls] = useControlsSignal();

  const [isFullscreen, enterFullscreen, exitFullscreen] = useFullscreen(videoRef, setPlaying);
  const { isReady, isBuffered, bufferedRanges, bufferingHandlers, bufferedProgress } =
    useBuffering();
  const isUnsupported = useUnsupportedMedia(videoRef);

  useAmbilight(videoRef, canvasRef);

  const handleTimeUpdate = useLastCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;

    if (video.readyState >= MIN_READY_STATE) {
      setWaiting(false);
      setCurrentTime(video.currentTime);
    }
  });

  const handleSeek = useLastCallback((position: number) => {
    videoRef.current!.currentTime = clamp(position, 0, duration);
  });

  const togglePlayState = useLastCallback(
    async (e: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => {
      e.stopPropagation();

      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (isPlaying) {
        pauseMedia(videoEl);
        setPlaying(false);
      } else {
        const playbackSuccess = await playMedia(videoEl);

        if (playbackSuccess) {
          setPlaying(true);
        }
      }
    },
  );

  const handleClick = useLastCallback(async (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    if (isAdsMessage) {
      onAdsClick?.(true);
    }

    if (disableClickActions) {
      return;
    }
  });

  const handleVideoLeave = useLastCallback(e => {
    const bounds = videoRef.current?.getBoundingClientRect();

    if (!bounds) return;
    if (
      e.clientX < bounds.left ||
      e.clientX > bounds.right ||
      e.clientY < bounds.top ||
      e.clientY > bounds.bottom
    ) {
      toggleControls(false);
    }
  });

  const handleVolumeChange = useLastCallback((value: number) => {
    setMediaVolume(videoRef.current!, value);
  });

  const handleMuteClick = useLastCallback(() => {
    setMediaMute(videoRef.current!, !videoRef.current!.muted);
  });

  const handlePlaybackRateChange = useLastCallback((value: number) => {
    setMediaPlayBackRate(videoRef.current!, value);
  });

  const handlePlay = useLastCallback(() => {
    setPlaying(true);
  });

  const handleWaiting = useLastCallback(() => {
    setWaiting(true);
  });

  const handleFullscreenChange = useLastCallback(() => {
    if (isFullscreen && exitFullscreen) exitFullscreen();
    else if (!isFullscreen && enterFullscreen) enterFullscreen();
  });

  useEffect(() => {
    const isMobile = !IS_TOUCH_ENV && !forceMobileView;
    const videoElement = videoRef.current;

    if (videoElement && !isMobile) {
      playMedia(videoElement);
    }
  }, [mediaUrl, isUnsupported]);

  return (
    <div className={s.VideoPlayer}>
      <video
        id="media-viewer-video"
        ref={videoRef}
        className={s.Video}
        src={mediaUrl as string}
        controls={false}
        controlsList="nodownload"
        playsInline
        onPlay={handlePlay}
        onWaiting={handleWaiting}
        onTimeUpdate={handleTimeUpdate}
        onContextMenu={stopEvent}
      />

      <div className={s.PlayerControlsWrapper}>
        <VideoPlayerControls
          isControlsVisible={isControlsVisible}
          waitingSignal={waitingSignal}
          currentTimeSignal={currentTime}
          bufferedRanges={[]}
          bufferedProgress={0}
          duration={duration} // Pass the correct duration
          isReady={isReady}
          fileSize={0}
          isPlaying={false}
          isFullscreenSupported={false}
          isPictureInPictureSupported={false}
          isFullscreen={false}
          isBuffered={false}
          volume={0}
          isMuted={false}
          playbackRate={0}
          isForceMobileVersion={forceMobileView}
          onChangeFullscreen={handleFullscreenChange}
          onVolumeClick={handleMuteClick}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleControls={toggleControls}
          onPlayPause={togglePlayState}
          onSeek={handleSeek}
        />
      </div>

      <canvas id="ambilight" ref={canvasRef} className={s.CinematicLight} />
      <div
        ref={bottomRef}
        className="VideoPlayerBottom"
        role="contentinfo"
        aria-label="Video Player Bottom"
        data-in-view={true}
      />
    </div>
  );
};

export default memo(VideoPlayer);
