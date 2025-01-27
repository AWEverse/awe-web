import { ApiDimensions } from "@/@types/api/types/messages";
import { BufferedRange } from "@/lib/hooks/ui/useBuffering";
import { FC, memo, use, useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

import s from "./SeekLine.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import buildStyle from "@/shared/lib/buildStyle";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { clamp, IS_TOUCH_ENV, round } from "@/lib/core";
import useSignal from "@/lib/hooks/signals/useSignal";
import { captureEvents } from "@/lib/utils/captureEvents";
import { useSignalEffect } from "@/lib/hooks/signals/useSignalEffect";
import useSeekerEvents from "../hooks/useSeekerEvents";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps {
  waitingSignal: ReadonlySignal<boolean>;
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

const LOCK_TIMEOUT = 250;
const DEBOUNCE = 200;

const SeekLine: FC<OwnProps> = ({
  waitingSignal,
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
  const isLockedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seekerRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const previewTimeRef = useRef<HTMLDivElement | null>(null);

  const [previewVisibleSignal, setPreviewVisible] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);

  const previewOffsetSignal = useSignal(0);

  useSignalEffect(bufferedRangesSignal, (ranges) => {
    console.log(ranges);

    setBufferedRanges(ranges);
  });

  useSignalEffect(
    currentTimeSignal,
    (time) => {
      const progressEl = progressRef.current;

      if (progressEl) {
        progressEl.style.willChange = "transform";
        progressEl.style.transform = moveX(time, duration);
        progressEl.setAttribute("aria-valuenow", `${round(time)}`);
      }
    },
    [duration],
  );

  const handleSeek = useStableCallback((position: number) => {
    setPreviewVisible(true);
    onSeek?.(position);
  });

  const handleSeekStart = useStableCallback(() => {
    setIsSeeking(true);
    onSeekStart?.();
  });

  const handleSeekEnd = useStableCallback((endPoint: number) => {
    isLockedRef.current = true;
    setPreviewVisible(false);
    setIsSeeking(false);

    onSeek?.(endPoint);
    onSeekEnd?.();

    setTimeout(() => {
      isLockedRef.current = false;
    }, LOCK_TIMEOUT);
  });

  useSeekerEvents({
    seekerRef,
    previewRef,
    onSeek: handleSeek,
    onSeekStart: handleSeekStart,
    onSeekEnd: handleSeekEnd,
    isPreviewDisabled,
    isActive: isActive!,
    duration,
  });

  return (
    <div ref={seekerRef} className={s.container}>
      {!isPreviewDisabled && (
        <CSSTransition nodeRef={previewRef} in={isReady} timeout={0}>
          <div ref={previewRef} className={s.preview}>
            <canvas
              className={s.previewCanvas}
              ref={previewCanvasRef}
              width={posterSize?.width}
              height={posterSize?.height}
            />
            <div className={s.previewTime}>
              <span className={s.previewTimeText} ref={previewTimeRef} />
            </div>
          </div>
        </CSSTransition>
      )}
      <div className={s.track}>
        {/* {bufferedRanges.map(({ start, end }, index) => (
          <div
            key={`${index}_${start}_${end}`}
            className={s.buffered}
            style={buildStyle(
              `left: ${start * 100}%;`,
              `right: ${100 - end * 100}%;`,
            )}
          />
        ))} */}
      </div>
      <div
        className={s.track}
        tabIndex={0}
        role="slider"
        aria-label="Seek slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        draggable={false}
      >
        <div
          ref={progressRef}
          className={buildClassName(s.played, isSeeking && s.seeking)}
          role="presentation"
        />
        <div className={s.trackBg} />
      </div>
    </div>
  );
};

const moveX = (value: number, duration: number) =>
  `translateX(${round((value / duration) * 100, 1)}%)`;

export default memo(SeekLine);
