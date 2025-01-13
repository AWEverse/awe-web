import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import React, { FC, memo, useEffect, useLayoutEffect, useRef } from 'react';
import SeekLine from './SeekLine';

import s from './VideoPlayerControls.module.scss';
import { Signal } from '@/lib/core/public/signals';
import { IconButton } from '@mui/material';
import {
  FullscreenRounded,
  PauseRounded,
  PictureInPictureAltRounded,
  SettingsRounded,
  SkipNextRounded,
  VolumeUpRounded,
  WidthFullRounded,
} from '@mui/icons-material';
import { formatTime } from '../../private/lib/utils';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { clamp } from '@/lib/core';

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

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 1.5, 2];

const HIDE_CONTROLS_TIMEOUT_MS = 3000;

const VideoPlayerControls: FC<OwnProps> = ({
  currentTimeSignal,
  waitingSignal,
  duration,
  isReady,
  onSeek,
  onChangeFullscreen,
  onPlayPause,
  onPlaybackRateChange,
  onVolumeChange,
  onVolumeClick,
  onPictureInPictureChange,
}) => {
  const timeRef = useRef<HTMLTimeElement | null>(null);

  useLayoutEffect(() => {
    const unsubscribe = currentTimeSignal.subscribe(time => {
      if (timeRef.current) {
        timeRef.current.textContent = formatTime(time);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentTimeSignal, isReady]);

  const handleVolumeChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    onVolumeChange(Number(e.currentTarget.value) / 100),
  );

  return (
    <section className={s.PlayerControls}>
      <SeekLine
        waitingSignal={waitingSignal}
        currentTimeSignal={currentTimeSignal}
        duration={duration}
        bufferedRanges={[]}
        playbackRate={10}
        isReady={false}
        onSeek={onSeek}
        onSeekStart={() => {}}
      />
      <IconButton onClick={onPlayPause}>
        <PauseRounded />
      </IconButton>
      <IconButton>
        <SkipNextRounded />
      </IconButton>
      <IconButton onClick={onVolumeClick}>
        <VolumeUpRounded />
      </IconButton>
      <label className={s.slider}>
        <input
          type="range"
          className={s.level}
          min={0}
          max={100}
          onChange={handleVolumeChange}
          onClick={onVolumeClick}
        />
      </label>

      <div className={s.Time}>
        <time ref={timeRef} aria-label="Current time position"></time>
        <span>&nbsp;/&nbsp;</span>
        <time aria-label="Total duration" dateTime={formatTime(duration)}>
          {formatTime(duration)}
        </time>
      </div>

      <div className={s.divider} />

      <IconButton>
        <SettingsRounded />
      </IconButton>

      <IconButton>
        <PictureInPictureAltRounded />
      </IconButton>
      <IconButton>
        <WidthFullRounded />
      </IconButton>
      <IconButton>
        <FullscreenRounded />
      </IconButton>
    </section>
  );
};

export default memo(VideoPlayerControls);
