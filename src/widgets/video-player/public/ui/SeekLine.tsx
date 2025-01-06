import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import { FC, memo, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import s from './SeekLine.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface OwnProps {
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

const SeekLine: FC<OwnProps> = ({
  duration,
  bufferedRanges,
  isReady,
  posterSize,
  playbackRate,
  url,
  isActive,
  isPlaying,
  isPreviewDisabled,
  onSeek,
  onSeekStart,
}) => {
  const seekerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const previewTimeRef = useRef<HTMLDivElement>(null);

  return (
    <div className={s.container} ref={seekerRef}>
      {!isPreviewDisabled && (
        <CSSTransition
          isOpen
          className={s.preview}
          style={`width: ${previewSize.width}px; height: ${previewSize.height}px`}
          ref={previewRef}
        >
          <canvas className={s.previewCanvas} ref={previewCanvasRef} />
          <div className={s.previewTime}>
            <span className={s.previewTimeText} ref={previewTimeRef} />
          </div>
        </CSSTransition>
      )}
      <div className={s.track}>
        {bufferedRanges.map(({ start, end }) => (
          <div
            key={`${start}-${end}`}
            className={s.buffered}
            // @ts-ignore
            style={`left: ${start * 100}%; right: ${100 - end * 100}%`}
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
