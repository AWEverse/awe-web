import { ApiDimensions } from "@/@types/api/types/messages";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import { FC, memo, useRef, useState } from "react";

import s from "./VideoPlayerMetter.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { round } from "@/lib/core";
import { useSignalEffect } from "@/lib/hooks/signals/useSignalEffect";
import { useStableCallback } from "@/shared/hooks/base";
import useSeekerEvents from "../hooks/useSeekerEvents";
import { useDebouncedFunction } from "@/shared/hooks/shedulers";
import useBufferedCanvas from "../hooks/useBufferedCanvas";

interface VideoPlayerMetterProps {
  currentTimeSignal: ReadonlySignal<number>;
  bufferedRangesSignal: ReadonlySignal<BufferedRange[]>;
  url?: string;
  duration: number;
  playbackRate: number;
  isActive?: boolean;
  isPlaying?: boolean;
  isPreviewDisabled?: boolean;
  isReady: boolean;
  posterSize?: ApiDimensions;
  onSeek: (position: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
}

const LOCK_TIMEOUT_MS = 250;
const SEEK_DEBOUNCE_MS = 200;

const VideoPlayerMetter: FC<VideoPlayerMetterProps> = ({
  currentTimeSignal,
  bufferedRangesSignal,
  url,
  duration,
  playbackRate,
  isActive,
  isPlaying,
  isPreviewDisabled = true,
  isReady,
  posterSize,
  onSeek,
  onSeekStart,
  onSeekEnd,
}) => {
  const isLocked = useRef<boolean>(false);

  const seekerContainer = useRef<HTMLDivElement | null>(null);
  const previewCanvas = useRef<HTMLCanvasElement | null>(null);
  const previewContainer = useRef<HTMLDivElement | null>(null);
  const progressBar = useRef<HTMLDivElement | null>(null);
  const previewTimeDisplay = useRef<HTMLDivElement | null>(null);

  const [isSeeking, _setIsSeeking] = useState(false);

  const canvasRef = useBufferedCanvas(bufferedRangesSignal.value, duration);

  const setIsSeeking = useDebouncedFunction(
    _setIsSeeking,
    SEEK_DEBOUNCE_MS,
    false,
    false,
  );

  useSignalEffect(
    currentTimeSignal,
    (time) => {
      if (progressBar.current) {
        progressBar.current.style.transform = calculateXPosition(
          time,
          duration,
        );
        progressBar.current.setAttribute("aria-valuenow", `${round(time)}`);
      }
    },
    [duration],
  );

  const handleSeek = useStableCallback((position: number) => {
    onSeek?.(position);
  });

  const handleSeekStart = useStableCallback(() => {
    setIsSeeking(true);
    onSeekStart?.();
  });

  const handleSeekEnd = useStableCallback((position: number) => {
    isLocked.current = true;
    setIsSeeking(false);

    onSeek?.(position);
    onSeekEnd?.();

    setTimeout(() => {
      isLocked.current = false;
    }, LOCK_TIMEOUT_MS);
  });

  useSeekerEvents({
    seekerRef: seekerContainer,
    previewRef: previewContainer,
    isActive: true,
    duration,
    onSeek: handleSeek,
    onSeekStart: handleSeekStart,
    onSeekEnd: handleSeekEnd,
  });

  return (
    <div ref={seekerContainer} className={s.container} itemScope>
      {!isPreviewDisabled && (
        <div
          ref={previewContainer}
          className={s.preview}
          aria-label="Media preview"
        >
          <canvas
            className={s.previewCanvas}
            ref={previewCanvas}
            width={posterSize?.width}
            height={posterSize?.height}
            aria-label="Media timeline preview"
            role="img"
          />
          <div className={s.previewTime} aria-hidden="true">
            <span
              className={s.previewTimeText}
              ref={previewTimeDisplay}
              itemProp="timecode"
            />
          </div>
        </div>
      )}

      <div
        className={s.track}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        itemProp="duration"
      >
        <canvas
          ref={canvasRef}
          height={10}
          style={{ width: "100%", height: "100%" }}
        />
        <div
          ref={progressBar}
          className={buildClassName(
            s.played,
            isPlaying && s.playing,
            isSeeking && s.seeking,
          )}
          role="presentation"
        />
        <div className={s.trackBg} aria-hidden="true" />
      </div>

      {posterSize && (
        <>
          <meta itemProp="width" content={String(posterSize.width)} />
          <meta itemProp="height" content={String(posterSize.height)} />
        </>
      )}
    </div>
  );
};

const calculateXPosition = (value: number, duration: number) =>
  `translateX(${round((value / duration) * 100, 3)}%)`;

export default memo(VideoPlayerMetter);
