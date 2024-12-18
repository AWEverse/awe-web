import { FC, memo, useCallback, useEffect, useRef } from 'react';
import useCounter from '../hooks/useCounter';
import buildClassName from '@/shared/lib/buildClassName';
import './TallyCounter.scss';
import { AddRounded, RemoveRounded } from '@mui/icons-material';
import useLongPress from '@/lib/hooks/events/useLongPress';
import useLastCallback from '@/lib/hooks/events/useLastCallback';

interface OwnProps {
  className?: string;
  range?: [number, number];
  initialValue?: number;
  onChange?: (value: number) => void;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'bigger' | 'jumbo';
  loop?: boolean;
  treshhold?: number;
}

const TallyCounter: FC<OwnProps> = ({
  className,
  range,
  initialValue = 0,
  size = 'large',
  onChange,
  loop = false,
  treshhold = 50,
}) => {
  const [min, max] = range || [-Infinity, Infinity];
  const { count, increment, decrement } = useCounter({ initialValue, min, max, loop });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = useCallback(
    (callback: () => void) => () => {
      intervalRef.current = setInterval(() => {
        callback();
        onChange?.(count);
      }, treshhold);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treshhold],
  );

  const stopInterval = useLastCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  });

  const decrementListeners = useLongPress({
    onStart: startInterval(decrement),
    onEnd: stopInterval,
    threshold: 500,
  });

  const incrementListeners = useLongPress({
    onStart: startInterval(increment),
    onEnd: stopInterval,
    threshold: 500,
  });

  useEffect(() => {
    onChange?.(count);
  }, [count, onChange]);

  return (
    <div
      className={buildClassName('tally-counter', size, className)}
      data-count={count}
      data-max={max}
      data-min={min}
    >
      <button
        className="tally-counter__decrement"
        type="button"
        onClick={decrement}
        {...decrementListeners}
      >
        <RemoveRounded />
      </button>
      <div className="tally-counter__container">
        <span className="tally-counter__resetMark">/</span>
        <span className="tally-counter__value" data-count={count} onClick={increment}>
          {count}
        </span>
      </div>
      <button
        className="tally-counter__increment"
        type="button"
        onClick={increment}
        {...incrementListeners}
      >
        <AddRounded />
      </button>
    </div>
  );
};

export default memo(TallyCounter);
