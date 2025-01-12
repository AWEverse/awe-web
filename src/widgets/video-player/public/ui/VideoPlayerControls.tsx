import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import { FC } from 'react';
import SeekLine from './SeekLine';

import s from './VideoPlayerControls.module.scss';
import { Signal } from '@/lib/core/public/signals';

type OwnProps = {
  currentTimeSignal: Signal<number>;
  waitingSignal: Signal<boolean>;
  url?: string;
  bufferedRanges: BufferedRange[];
  bufferedProgress: number;
  duration: number;
  isReady: boolean;
  fileSize: number;
  isForceMobileVersion?: boolean;
  isPlaying: boolean;
  isFullscreenSupported: boolean;
  isPictureInPictureSupported: boolean;
  isFullscreen: boolean;
  isPreviewDisabled?: boolean;
  isBuffered: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  posterSize?: ApiDimensions;
  onChangeFullscreen: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onPictureInPictureChange?: () => void;
  onVolumeClick: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (playbackRate: number) => void;
  onPlayPause: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSeek: (position: number) => void;
};

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

const HIDE_CONTROLS_TIMEOUT_MS = 3000;

const VideoPlayerControls: FC<OwnProps> = ({ currentTimeSignal, waitingSignal, duration }) => {
  return (
    <section className={s.PlayerControls}>
      <SeekLine
        waitingSignal={waitingSignal}
        currentTimeSignal={currentTimeSignal}
        duration={duration}
        bufferedRanges={[]}
        playbackRate={10}
        isReady={false}
        onSeek={() => {}}
        onSeekStart={() => {}}
      />
      dasd
    </section>
  );
};

export default VideoPlayerControls;
