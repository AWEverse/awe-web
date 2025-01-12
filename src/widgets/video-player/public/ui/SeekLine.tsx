import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import { FC, memo, use, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import s from './SeekLine.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';
import useCurrentTimeSignal from '../../private/hooks/useCurrentTimeSignal';
import { Signal } from '@/lib/core/public/signals';
import { clamp, IS_TOUCH_ENV, round, throttle } from '@/lib/core';
import { requestMutation } from '@/lib/modules/fastdom/fastdom';
import { animateNumber } from '@/lib/utils/animation/animateNumber';
import useSignal from '@/lib/hooks/signals/useSignal';
import { captureEvents } from '@/lib/utils/captureEvents';

interface OwnProps {
  waitingSignal: Signal<boolean>;
  currentTimeSignal: Signal<number>;
  url?: string;
  duration: number;
  bufferedRanges: BufferedRange[];
  playbackRate: number;
  isActive?: boolean;
  isPlaying?: boolean;
  isPreviewDisabled?: boolean;
  isReady: boolean;
  posterSize?: ApiDimensions;
  onSeek: (position: number) => void;
  onSeekStart: () => void;
}

const LOCK_TIMEOUT = 250;

const SeekLine: FC<OwnProps> = ({
  waitingSignal,
  currentTimeSignal,
  duration,
  bufferedRanges,
  isReady,
  posterSize = { width: 200, height: 100 },
  playbackRate,
  url,
  isActive,
  isPlaying,
  isPreviewDisabled,
  onSeek,
  onSeekStart,
}) => {
  const cancelAnimation = useRef<Function | undefined>(undefined);
  const isLockedRef = useRef<boolean>(false);

  const seekerRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const previewTimeRef = useRef<HTMLDivElement | null>(null);

  const [previewVisibleSignal, setPreviewVisible] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const previewOffsetSignal = useSignal(0);
  const selectedTimeSignal = useSignal(currentTimeSignal.value);

  const calculatePreviewPosition = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!seekerRef.current || !isActive) return undefined;

      const seeker = seekerRef.current;
      const seekerSize = seeker.getBoundingClientRect();
      const pageX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;

      const time = clamp(duration * ((pageX - seekerSize.left) / seekerSize.width), 0, duration);

      if (isPreviewDisabled) {
        return [time, 0];
      }

      const preview = previewRef.current!;

      const previewOffset = clamp(
        pageX - seekerSize.left - preview.clientWidth / 2,
        -4,
        seekerSize.width - preview.clientWidth + 4,
      );

      return [time, previewOffset];
    },
    [seekerRef, isActive, isPreviewDisabled, duration],
  );

  useLayoutEffect(() => {
    const unsubscribe = currentTimeSignal.subscribe(value => {
      requestMutation(() => {
        if (!progressRef.current) return;

        progressRef.current.style.width = `${round((value / duration) * 100, 2)}%`;
      });
    });

    return () => unsubscribe();
  }, [currentTimeSignal, duration]);

  return (
    <div className={s.container} ref={seekerRef}>
      {/* {!isPreviewDisabled && (
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
      )} */}
      <div className={s.track}>
        {bufferedRanges.map(({ start, end }) => (
          <div
            key={`${start}-${end}`}
            className={s.buffered}
            style={buildStyle(`left: ${start * 100}%;`, `right: ${100 - end * 100}%;`)}
          />
        ))}
      </div>
      <div className={s.track}>
        <div ref={progressRef} className={buildClassName(s.played, isSeeking && s.seeking)} />
      </div>
    </div>
  );
};

export default memo(SeekLine);
