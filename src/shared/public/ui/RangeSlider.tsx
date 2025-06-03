import { FC, useCallback, ChangeEvent, useMemo, memo } from 'react';
import buildClassName from '../lib/buildClassName';
import './RangeSlider.scss';

type OwnProps = {
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  value: number;
  disabled?: boolean;
  bold?: boolean;
  className?: string;
  renderValue?: (value: number) => string;
  onChange: (value: number) => void;
};

const RangeSlider: FC<OwnProps> = memo(props => {
  const {
    options,
    min = 0,
    max = options ? options.length - 1 : 100,
    step = 1,
    label,
    value,
    disabled,
    bold,
    className,
    renderValue,
    onChange,
  } = props;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.currentTarget.value));
    },
    [onChange],
  );

  const mainClassName = buildClassName(className, 'RangeSlider', disabled && 'disabled', bold && 'bold');

  const trackWidth = useMemo(() => {
    if (options) {
      return (value / (options.length - 1)) * 100;
    } else {
      const possibleValuesLength = (max - min) / step;
      return ((value - min) / possibleValuesLength) * 100;
    }
  }, [options, value, max, min, step]);

  return (
    <div className={mainClassName}>
      {label && (
        <div className="slider-top-row">
          <span className="label" dir="auto">
            {label}
          </span>
          {!options && (
            <span className="value" dir="auto">
              {renderValue ? renderValue(value) : value}
            </span>
          )}
        </div>
      )}
      <div className="slider-main">
        <div className="slider-fill-track" style={{ width: `${trackWidth}%` }} />
        <input
          className="RangeSlider__input"
          max={max}
          min={min}
          step={step}
          type="range"
          value={value}
          onChange={handleChange}
        />
        {options && (
          <div className="slider-options">
            {options.map((option, index) => (
              <div className={buildClassName('slider-option', index === value && 'active')} onClick={() => onChange(index)}>
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default RangeSlider;
