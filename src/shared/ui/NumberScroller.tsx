import { FC, ChangeEvent, useEffect, useState, memo, useRef } from 'react';
import buildClassName from '../lib/buildClassName';
import s from './NumberScroller.module.scss';
import useLastCallback from '@/lib/hooks/events/useLastCallback';

interface OwnProps {
  currentNumber: number;
  onChange?: (value: number) => void;
  infinite?: boolean;
  listClassName?: string;
  wrapperClassName?: string;
  animate?: boolean;
}

const NUMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const NumberScroller: FC<OwnProps> = memo(
  ({ currentNumber = 0, onChange, infinite = false, listClassName, wrapperClassName }) => {
    const [current, setCurrent] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setCurrent(currentNumber);
    }, [currentNumber]);

    const wrapperClassNames = buildClassName(s.wrapper, wrapperClassName, infinite && s.infinite);
    const listClassNames = buildClassName(s.number, listClassName);

    const handleChange = useLastCallback((event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.currentTarget.value);

      if (!isNaN(value)) {
        onChange?.(value);
      }
    });

    return (
      <div className={wrapperClassNames} role="listbox" tabIndex={0}>
        <input
          ref={inputRef}
          className={s.hiddenState}
          type="number"
          value={current}
          onChange={handleChange}
        />
        <div className={listClassNames} data-number={current} role="list">
          {NUMS.map(num => (
            <span key={num} aria-selected={current === num} role="option" tabIndex={0}>
              {num}
            </span>
          ))}
        </div>
      </div>
    );
  },
);

export default NumberScroller;
