import { ChangeEvent, FC, memo, useCallback } from 'react';
import './SwitchButton.scss';
import buildClassName from '../lib/buildClassName';

interface OwnProps {
  id?: string;
  name?: string;
  value?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  inactive?: boolean;
  noAnimation?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onCheck?: (isChecked: boolean) => void;
}

const SwitchButton: FC<OwnProps> = props => {
  const { id, name, value, label, checked, disabled, inactive, noAnimation, onChange, onCheck } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }

      if (onCheck) {
        onCheck(e.currentTarget.checked);
      }
    },
    [onChange, onCheck],
  );

  const classNames = buildClassName(
    'switch-button',
    disabled && 'disabled',
    inactive && 'inactive',
    noAnimation && 'no-animation',
  );

  return (
    <label className={classNames} htmlFor={id || 'switch'} title={label}>
      <div className="switch-outer">
        <input
          checked={checked}
          disabled={disabled}
          id={id || 'switch'}
          name={name}
          type="checkbox"
          value={value}
          onChange={handleChange}
        />
        <span className="button-toggle"></span>
      </div>
    </label>
  );
};

export default memo(SwitchButton);
