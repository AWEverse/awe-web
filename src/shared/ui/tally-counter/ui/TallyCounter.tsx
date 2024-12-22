import { FC, memo, useCallback, useEffect, useState } from 'react';
import useCounter from '../hooks/useCounter';
import buildClassName from '@/shared/lib/buildClassName';
import './TallyCounter.scss';
import { AddRounded, RemoveRounded } from '@mui/icons-material';
import useLongPress from '@/lib/hooks/events/useLongPress';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useInterval from '@/lib/hooks/shedulers/useInterval';

interface OwnProps {
  className?: string;
  range?: [number, number];
  initialValue?: number;
  onChange?: (value: number) => void;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'bigger' | 'jumbo';
  loop?: boolean;
  threshold?: number;
}

const TallyCounter: FC<OwnProps> = ({
  className,
  range = [-Infinity, Infinity],
  initialValue = 0,
  size = 'large',
  onChange,
  loop = false,
  threshold = 50,
}) => {
  const { count, increment, decrement } = useCounter({
    initialValue,
    min: range[0],
    max: range[1],
    loop,
  });

  // Managing interval state for continuous increment/decrement during long press
  const [intervalActive, setIntervalActive] = useState(false);

  useInterval(
    () => {
      if (intervalActive) {
        increment();
        onChange?.(count);
      }
    },
    intervalActive ? threshold : undefined,
  );

  const startInterval = useCallback(() => {
    setIntervalActive(true);
  }, []);

  const stopInterval = useLastCallback(() => {
    setIntervalActive(false);
  });

  const longPressListeners = useLongPress({
    onStart: startInterval,
    onEnd: stopInterval,
    threshold: 500,
  });

  useEffect(() => {
    onChange?.(count);
  }, [count, onChange]);

  const handleIncrement = useCallback(() => {
    increment();
    onChange?.(count);
  }, [count, onChange]);

  const handleDecrement = useCallback(() => {
    decrement();
    onChange?.(count);
  }, [count, onChange]);

  return (
    <div
      className={buildClassName('tally-counter', size, className)}
      data-count={count}
      data-max={range[1]}
      data-min={range[0]}
    >
      <button
        className="tally-counter__decrement"
        type="button"
        onClick={handleDecrement}
        {...longPressListeners}
        aria-label="Decrement count"
      >
        <RemoveRounded />
      </button>
      <div className="tally-counter__container">
        <span className="tally-counter__resetMark">/</span>
        <span
          className="tally-counter__value"
          data-count={count}
          onClick={handleIncrement}
          aria-label="Increment count"
        >
          {count}
        </span>
      </div>
      <button
        className="tally-counter__increment"
        type="button"
        onClick={handleIncrement}
        {...longPressListeners}
        aria-label="Increment count"
      >
        <AddRounded />
      </button>
    </div>
  );
};

export default memo(TallyCounter);
