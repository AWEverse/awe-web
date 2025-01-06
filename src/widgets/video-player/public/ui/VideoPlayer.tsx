import { ApiDimensions } from '@/@types/api/types/messages';
import { IS_IOS, IS_TOUCH_ENV } from '@/lib/core';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { ObserveFn } from '@/lib/hooks/sensors/useIntersectionObserver';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { memo, useState } from 'react';
import useFullscreen from '../hooks/useFullScreen';
import useAppLayout from '@/lib/hooks/ui/useAppLayout';
import useUnsupportedMedia from '../hooks/useSupportCheck';
import Video from '@/shared/ui/Video';

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
  observeIntersectionForBottom: ObserveFn;
  observeIntersectionForLoading: ObserveFn;
  observeIntersectionForPlaying: ObserveFn;
  onAdsClick?: (triggeredFromMedia?: boolean) => void;
  onCloseMediaViewer: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  playbackSpeed: number;
  posterDimensions?: ApiDimensions; // width and height
  posterSource?: string;
  progressPercentage?: number;
  totalFileSize: number;
};

const MAX_LOOP_DURATION = 30; // Seconds
const MIN_READY_STATE = 4;
const REWIND_STEP = 5; // Seconds

const VideoPlayer = ({
  ref,
  mediaUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  posterDimensions,
  forceMobileView,
}: OwnProps) => {
  const videoRef = useRefInstead(ref);

  const [isPlaying, setIsPlaying] = useState(!IS_TOUCH_ENV || !IS_IOS);
  const [isFullscreen, setFullscreen, exitFullscreen] = useFullscreen(videoRef, setIsPlaying);

  const { isMobile } = useAppLayout();
  const duration = videoRef.current?.duration || 0;
  const isLooped = duration <= MAX_LOOP_DURATION;

  const handleVideoMove = useLastCallback(() => {});

  const handleVideoLeave = useLastCallback(() => {});

  const isUnsupported = useUnsupportedMedia(videoRef, !mediaUrl);

  const wrapperStyle =
    posterDimensions && `width: ${posterDimensions.width}px; height: ${posterDimensions.height}px`;
  const shouldToggleControls = !IS_TOUCH_ENV && !forceMobileView;

  return (
    <div
      className="VideoPlayer"
      onMouseMove={shouldToggleControls ? handleVideoMove : undefined}
      onMouseOut={shouldToggleControls ? handleVideoLeave : undefined}
    >
      <div>
        <Video
          src="https://media.w3.org/2010/05/sintel/trailer.mp4"
          ref={videoRef}
          canPlay={isPlaying}
        />
      </div>
    </div>
  );
};

export default memo(VideoPlayer);
