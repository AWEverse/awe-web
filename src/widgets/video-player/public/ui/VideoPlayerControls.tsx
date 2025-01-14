import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import React, { FC, memo, useEffect, useLayoutEffect, useRef } from 'react';
import SeekLine from './SeekLine';

import s from './VideoPlayerControls.module.scss';
import { ReadonlySignal, Signal } from '@/lib/core/public/signals';
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
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { clamp, IS_TOUCH_ENV } from '@/lib/core';
import { formatMediaDuration } from '../../private/lib/utils';
import useSignal from '@/lib/hooks/signals/useSignal';
import useFlag from '@/lib/hooks/state/useFlag';
import useTimeout from '@/lib/hooks/shedulers/useTimeout';
import buildClassName from '@/shared/lib/buildClassName';
import stopEvent from '@/lib/utils/stopEvent';

type OwnProps = {
  isControlsVisible: boolean;
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
  onToggleControls: (flag: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (playbackRate: number) => void;
  onPlayPause: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSeek: (position: number) => void;
};

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 1.5, 2];

const HIDE_CONTROLS_TIMEOUT_MS = 3000;

const VideoPlayerControls: FC<OwnProps> = ({
  isControlsVisible,
  currentTimeSignal,
  waitingSignal,
  duration,
  isReady,
  isForceMobileVersion,
  isPlaying,
  onToggleControls,
  onSeek,
  onChangeFullscreen,
  onPlayPause,
  onPlaybackRateChange,
  onVolumeChange,
  onVolumeClick,
  onPictureInPictureChange,
}) => {
  const timeRef = useRef<HTMLTimeElement | null>(null);

  const [isPlaybackMenuOpen, openPlaybackMenu, closePlaybackMenu] = useFlag();
  const isSeeking = useRef(false);

  useEffect(() => {
    if (!IS_TOUCH_ENV && !isForceMobileVersion) {
      return;
    }

    const _isSeeking = isSeeking.current;

    const shouldClose = !isControlsVisible && !isPlaying && !isPlaybackMenuOpen && _isSeeking;

    if (shouldClose) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onToggleControls(false);
    }, HIDE_CONTROLS_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [
    isPlaying,
    isControlsVisible,
    isForceMobileVersion,
    isPlaybackMenuOpen,
    isSeeking,
    onToggleControls,
  ]);

  useLayoutEffect(() => {
    const unsubscribe = currentTimeSignal.subscribe(time => {
      if (timeRef.current) {
        timeRef.current.textContent = formatMediaDuration(time, {
          includeHours: time > 3600,
          forceTwoDigits: true,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentTimeSignal, isReady]);

  useLayoutEffect(() => {
    if (isControlsVisible) {
      document.body.classList.add('video-controls-visible');
    } else {
      document.body.classList.remove('video-controls-visible');
    }

    return () => {
      document.body.classList.remove('video-controls-visible');
    };
  }, [isControlsVisible]);

  const handleVolumeChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    onVolumeChange(Number(e.currentTarget.value) / 100),
  );

  const handleSeek = useLastCallback((position: number) => {
    isSeeking.current = false;
    onSeek?.(position);
  });

  const handleStartSeek = useLastCallback(() => {
    isSeeking.current = true;
  });

  return (
    <section
      className={buildClassName(
        s.PlayerControls,
        isForceMobileVersion && s.ForceMobile,
        isControlsVisible && s.active,
      )}
      onClick={stopEvent}
    >
      <SeekLine
        waitingSignal={waitingSignal}
        currentTimeSignal={currentTimeSignal}
        duration={duration}
        bufferedRanges={[]}
        playbackRate={10}
        isReady={false}
        onSeek={handleSeek}
        onSeekStart={handleStartSeek}
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
        <input type="range" className={s.level} min={0} max={100} onChange={handleVolumeChange} />
      </label>

      <div className={s.Time}>
        <time ref={timeRef} aria-label="Current time position"></time>
        <span>&nbsp;/&nbsp;</span>
        <time aria-label="Total duration">
          {formatMediaDuration(duration, {
            includeHours: duration > 3600,
            forceTwoDigits: true,
          })}
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
