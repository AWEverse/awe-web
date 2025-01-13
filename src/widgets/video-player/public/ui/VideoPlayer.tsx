import { ApiDimensions } from '@/@types/api/types/messages';
import { IS_IOS, IS_TOUCH_ENV, throttle } from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { ObserveFn } from '@/lib/hooks/sensors/useIntersectionObserver';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { memo, useRef, useState } from 'react';
import useFullscreen from '../hooks/useFullScreen';
import useAppLayout from '@/lib/hooks/ui/useAppLayout';
import useUnsupportedMedia from '../hooks/useSupportCheck';
import Video from '@/shared/ui/Video';

import s from './VideoPlayer.module.scss';
import VideoPlayerControls from './VideoPlayerControls';
import useCurrentTimeSignal from '../../private/hooks/useCurrentTimeSignal';
import useContextSignal from '../../private/hooks/useContextSignal';

type OwnProps = {
  ref?: React.RefObject<HTMLVideoElement | null>;
  audioVolume: number;
  closeOnMediaClick?: boolean;
  disableClickActions?: boolean;
  disablePreview?: boolean;
  forceMobileView?: boolean;
  hidePlayButton?: boolean;
  isAdsMessage?: boolean;
  isAudioMuted: boolean;
  isContentProtected?: boolean; // means non-available for download
  isViewerOpen?: boolean;
  mediaUrl?: string | string[];
  observeIntersectionForBottom?: ObserveFn;
  observeIntersectionForLoading?: ObserveFn;
  observeIntersectionForPlaying?: ObserveFn;
  onAdsClick?: (triggeredFromMedia?: boolean) => void;
  playbackSpeed: number;
  posterDimensions?: ApiDimensions; // width and height
  posterSource?: string;
  progressPercentage?: number;
  totalFileSize: number;
};

const MAX_LOOP_DURATION = 30; // Seconds
const MIN_READY_STATE = 4;
const REWIND_STEP = 5; // Seconds

const VideoPlayer: React.FC<OwnProps> = ({ ref, mediaUrl, posterDimensions, forceMobileView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0); // Store duration here

  const [currentTime, setCurrentTime] = useContextSignal(0);
  const [waitingSignal, setWaiting] = useContextSignal(false);

  const handleTimeUpdate = useLastCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.readyState >= MIN_READY_STATE) {
      setCurrentTime(video.currentTime);
    }
  });

  const handleLoadedMetadata = useLastCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
  });

  const handleSeek = useLastCallback((position: number) => {
    console.log('handleSeek', position);
    videoRef.current!.currentTime = position;
  });

  return (
    <div className={s.VideoPlayer}>
      <video
        ref={videoRef}
        className={s.Video}
        src={'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
        controls
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata} // Listen to loadedmetadata to get the duration
      />

      <div className={s.PlayerControlsWrapper}>
        <VideoPlayerControls
          waitingSignal={waitingSignal}
          currentTimeSignal={currentTime}
          bufferedRanges={[]}
          bufferedProgress={0}
          duration={duration} // Pass the correct duration
          isReady={duration > 0}
          fileSize={0}
          isPlaying={false}
          isFullscreenSupported={false}
          isPictureInPictureSupported={false}
          isFullscreen={false}
          isBuffered={false}
          volume={0}
          isMuted={false}
          playbackRate={0}
          onChangeFullscreen={function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
            throw new Error('Function not implemented.');
          }}
          onVolumeClick={function (): void {
            throw new Error('Function not implemented.');
          }}
          onVolumeChange={function (volume: number): void {
            throw new Error('Function not implemented.');
          }}
          onPlaybackRateChange={function (playbackRate: number): void {
            throw new Error('Function not implemented.');
          }}
          onPlayPause={function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
            throw new Error('Function not implemented.');
          }}
          onSeek={handleSeek}
        />
      </div>

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
