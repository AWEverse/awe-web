import { ApiDimensions } from '@/@types/api/types/messages';
import { BufferedRange } from '@/lib/hooks/ui/useBuffering';
import { FC, memo, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import s from './SeekLine.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';

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
  posterSize = { width: 200, height: 100 },
  playbackRate,
  url,
  isActive,
  isPlaying,
  isPreviewDisabled,
  onSeek,
  onSeekStart,
}) => {
  const seekerRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const previewTimeRef = useRef<HTMLDivElement | null>(null);
  const [isSeeking, setSeeking] = useState(false);

  return (
    <div className={s.container} ref={seekerRef}>
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
