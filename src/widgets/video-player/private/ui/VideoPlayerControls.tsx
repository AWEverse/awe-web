import { ApiDimensions } from "@/@types/api/types/messages";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import React, { FC, lazy, memo, useEffect, useRef, useState } from "react";
import VideoPlayerMetter from "./VideoPlayerMetter";

import { ReadonlySignal } from "@/lib/core/public/signals";
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
import { useStableCallback } from "@/shared/hooks/base";
import { IS_TOUCH_ENV } from "@/lib/core";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import {
  useSignalEffect,
  useSignalLayoutEffect,
} from "@/lib/hooks/signals/useSignalEffect";
import SettingsDropdown from "./controls/SettingsDropdown";
import { TriggerProps } from "@/shared/ui/dropdown";
import s from "./VideoPlayerControls.module.scss";
import { formatMediaDuration } from "../lib/time/formatMediaDuration";

type OwnProps = {
  // Playback Control
  isPlaying: boolean;
  currentTimeSignal: ReadonlySignal<number>;
  volumeSignal: ReadonlySignal<number>;
  controlsSignal: ReadonlySignal<boolean>;
  duration: number;
  playbackRate: ReadonlySignal<number>;
  isMuted: boolean;

  // Buffered Media Info
  bufferedRangesSignal: ReadonlySignal<BufferedRange[]>;
  isReady: boolean;

  // Media Properties
  url?: string;
  fileSize: number;
  posterSize?: ApiDimensions;

  // UI State
  waitingSignal: ReadonlySignal<boolean>;
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
  onAmbientModeClick: () => void;
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

const VideoPlayerControls: FC<OwnProps> = ({
  isPlaying,
  currentTimeSignal,
  volumeSignal,
  controlsSignal,
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
  onAmbientModeClick,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLTimeElement>(null);
  const volumeRef = useRef<HTMLSpanElement>(null);

  const [isVisible, setVisibillity] = useState(true);
  const isSeeking = useRef(false);

  useSignalLayoutEffect(controlsSignal, (flag) => {
    setVisibillity(flag);
  });

  useEffect(() => {
    if (!IS_TOUCH_ENV && !isForceMobileVersion) {
      return;
    }

    const _isSeeking = isSeeking.current;

    const shouldClose = !isVisible && !isPlaying && _isSeeking;

    if (shouldClose) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onToggleControls(false);
    }, HIDE_CONTROLS_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [isPlaying, isVisible, isForceMobileVersion, isSeeking, onToggleControls]);

  useSignalEffect(
    bufferedRangesSignal,
    (ranges) => {
      const bufferedLength = ranges.sum((range) => range.end - range.start);
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

  const handleVolumeChange = useStableCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onVolumeChange(Number(e.currentTarget.value) / 100),
  );

  const handleSeek = useStableCallback((position: number) => {
    isSeeking.current = false;
    onSeek?.(position);
  });

  const handleStartSeek = useStableCallback(() => {
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
      <VideoPlayerMetter
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

      {!isForceMobileVersion && (
        <>
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
        </>
      )}

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

      {!isForceMobileVersion && (
        <>
          <SettingsDropdown
            position="bottom-right"
            triggerButton={TriggerButton}
            onPlaybackSpeedClick={onPlaybackRateChange}
            onAmbientModeClick={onAmbientModeClick}
          />

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
        </>
      )}

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

export default memo(VideoPlayerControls);
