import { ApiDimensions } from "@/@types/api/types/messages";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import SeekLine from "./SeekLine";

import s from "./VideoPlayerControls.module.scss";
import { Signal } from "@/lib/core/public/signals";
import { IconButton } from "@mui/material";
import {
  FullscreenExitRounded,
  FullscreenRounded,
  PauseRounded,
  PictureInPictureAltRounded,
  PlayArrowRounded,
  SettingsRounded,
  SkipNextRounded,
  VolumeUpRounded,
  WidthFullRounded,
} from "@mui/icons-material";
import useLastCallback from "@/lib/hooks/events/useLastCallback";
import { IS_TOUCH_ENV } from "@/lib/core";
import { formatMediaDuration } from "../../private/lib/utils";
import useFlag from "@/lib/hooks/state/useFlag";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useBodyClass from "@/shared/hooks/useBodyClass";
import {
  useSignalEffect,
  useSignalLayoutEffect,
} from "@/lib/hooks/signals/useSignalEffect";
import useDebouncedCallback from "@/lib/hooks/shedulers/useDebouncedCallback";
import SettingsDropdown from "../../private/ui/SettingsDropdown";
import { TriggerProps } from "@/shared/ui/DropdownMenu";

type OwnProps = {
  // Playback Control
  isPlaying: boolean;
  currentTimeSignal: Signal<number>;
  volumeSignal: Signal<number>;
  duration: number;
  playbackRate: number;
  isMuted: boolean;

  // Buffered Media Info
  bufferedRangesSignal: Signal<BufferedRange[]>;
  isReady: boolean;

  // Media Properties
  url?: string;
  fileSize: number;
  posterSize?: ApiDimensions;

  // UI State
  waitingSignal: Signal<boolean>;
  isForceMobileVersion?: boolean;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  isPictureInPictureSupported: boolean;
  isPreviewDisabled?: boolean;

  // Event Handlers
  onChangeFullscreen: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onPictureInPictureChange?: () => void;
  onPlayPause: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onVolumeClick: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (playbackRate: number) => void;
  onToggleControls: (flag: boolean) => void;
  onSeek: (position: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
};

const HIDE_CONTROLS_TIMEOUT_MS = 3000;
const DEBOUNCE = 200;

const TriggerButton: FC<TriggerProps> = ({ onTrigger }) => (
  <IconButton
    onClick={onTrigger}
    className={buildClassName(s.control, s.blendMode)}
  >
    <SettingsRounded className={s.icon} />
  </IconButton>
);

// Signals only change values ​​in the root component in the input file. Revised the ability to switch to a read-only signal

const VideoPlayerControls: FC<OwnProps> = ({
  isPlaying,
  currentTimeSignal,
  volumeSignal,
  duration,
  playbackRate,
  isMuted,
  bufferedRangesSignal,
  isReady,
  url,
  fileSize,
  posterSize,
  waitingSignal,
  isForceMobileVersion,
  isFullscreen,
  isFullscreenSupported,
  isPictureInPictureSupported,
  isPreviewDisabled,
  onChangeFullscreen,
  onPictureInPictureChange,
  onPlayPause,
  onVolumeChange,
  onPlaybackRateChange,
  onSeek,
  onToggleControls,
  onVolumeClick,
  onSeekStart,
  onSeekEnd,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLTimeElement>(null);
  const volumeRef = useRef<HTMLSpanElement>(null);

  const [isVisible, setVisibillity] = useState(true);
  const [isPlaybackMenuOpen, openPlaybackMenu, closePlaybackMenu] = useFlag();
  const isSeeking = useRef(false);
  const [isBuffered, _setIsBuffered] = useState(true);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const setIsBuffered = useDebouncedCallback(
    _setIsBuffered,
    [],
    DEBOUNCE,
    false,
    true,
  );

  useEffect(() => {
    if (!IS_TOUCH_ENV && !isForceMobileVersion) {
      return;
    }

    const _isSeeking = isSeeking.current;

    const shouldClose =
      !isVisible && !isPlaying && !isPlaybackMenuOpen && _isSeeking;

    if (shouldClose) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onToggleControls(false);
    }, HIDE_CONTROLS_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [
    isPlaying,
    isVisible,
    isForceMobileVersion,
    isPlaybackMenuOpen,
    isSeeking,
    onToggleControls,
  ]);

  useSignalEffect(
    bufferedRangesSignal,
    (ranges) => {
      const bufferedLength = ranges.sum((range) => range.end - range.start);

      setBufferedProgress(bufferedLength / duration);
    },
    [duration],
  );

  useSignalEffect(currentTimeSignal, (time) => {
    const currentTime = formatMediaDuration(time, {
      includeHours: time > 3600,
      forceTwoDigits: true,
    });

    if (timeRef.current) {
      timeRef.current.textContent = currentTime;
    }
  });

  useSignalLayoutEffect(volumeSignal, (volume) => {
    const percentage = Math.round(volume * 100);

    if (volumeRef.current) {
      volumeRef.current!.textContent = `${percentage}%`;
    }

    if (inputRef.current) {
      inputRef.current!.valueAsNumber = percentage;
    }
  });

  useBodyClass("video-controls-visible", isVisible);

  const handleVolumeChange = useLastCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onVolumeChange(Number(e.currentTarget.value) / 100),
  );

  const handleSeek = useLastCallback((position: number) => {
    isSeeking.current = false;
    onSeek?.(position);
  });

  const handleStartSeek = useLastCallback(() => {
    isSeeking.current = true;
    onSeekStart?.();
  });

  return (
    <section
      className={buildClassName(
        s.PlayerControls,
        isForceMobileVersion && s.ForceMobile,
        isVisible && s.active,
      )}
      onClick={stopEvent}
    >
      <SeekLine
        waitingSignal={waitingSignal}
        currentTimeSignal={currentTimeSignal}
        duration={duration}
        bufferedRangesSignal={bufferedRangesSignal}
        playbackRate={10}
        isReady={isReady}
        isActive={isVisible}
        isPreviewDisabled={isPreviewDisabled}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onSeekStart={handleStartSeek}
        onSeekEnd={onSeekEnd}
      />
      <IconButton
        className={buildClassName(s.control, s.blendMode)}
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <PauseRounded className={s.icon} />
        ) : (
          <PlayArrowRounded className={s.icon} />
        )}
      </IconButton>
      <IconButton className={buildClassName(s.control, s.blendMode)}>
        <SkipNextRounded className={s.icon} />
      </IconButton>
      <IconButton
        className={buildClassName(s.control, s.blendMode)}
        onClick={onVolumeClick}
      >
        <VolumeUpRounded className={s.icon} />
      </IconButton>
      <label className={s.slider}>
        <input
          ref={inputRef}
          type="range"
          className={s.level}
          min={0}
          max={100}
          onChange={handleVolumeChange}
        />
      </label>

      <div className={buildClassName(s.Time, s.blendMode)}>
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

      <SettingsDropdown triggerButton={TriggerButton} />

      {isPictureInPictureSupported && (
        <IconButton
          className={buildClassName(s.control, s.blendMode)}
          onClick={onPictureInPictureChange}
        >
          <PictureInPictureAltRounded className={s.icon} />
        </IconButton>
      )}
      <IconButton className={buildClassName(s.control, s.blendMode)}>
        <WidthFullRounded className={s.icon} />
      </IconButton>
      {isFullscreenSupported && (
        <IconButton
          className={buildClassName(s.control, s.blendMode)}
          onClick={onChangeFullscreen}
        >
          {isFullscreen ? (
            <FullscreenExitRounded className={s.icon} />
          ) : (
            <FullscreenRounded className={s.icon} />
          )}
        </IconButton>
      )}
    </section>
  );
};

function renderTime(currentTime: number, duration: number) {
  return (
    <div className="player-time">
      {`${formatMediaDuration(currentTime)} / ${formatMediaDuration(duration)}`}
    </div>
  );
}

export default memo(VideoPlayerControls);
