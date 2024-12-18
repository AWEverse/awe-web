import { ReactNode, FC, MouseEvent, memo, useCallback } from 'react';
import s from './ActionButton.module.scss';
import buildClassName from '../lib/buildClassName';
import RippleEffect from './ripple-effect';

type Sizes = 'small' | 'medium' | 'large';

interface OwnProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  count?: number;
  label?: string;
  labelClassName?: string;
  variant?: 'rounded' | 'outlined' | 'plain';
  size?: Sizes | `custom-${Sizes}`;
  loading?: boolean;
  swap?: boolean;
  children?: ReactNode;
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
}

const ActionButton: FC<OwnProps> = ({
  onClick,
  title,
  active = false,
  disabled = false,
  className,
  icon,
  label,
  labelClassName,
  variant = 'plain',
  size = 'custom-medium',
  loading = false,
  swap,
  children,
  startDecorator,
  endDecorator,
}) => {
  const buttonClassname = buildClassName(
    s.button,
    active && s.active,
    disabled && s.disabled,
    variant && s[variant],
    size && s[size],
    className,
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      onClick?.(event);
    }
  };

  const child = label || children;

  const renderContent = useCallback(
    () => (
      <>
        {swap ? (
          <>
            {child && <span className={buildClassName(s.label, labelClassName)}>{child}</span>}
            {icon && <i className={s.icon}>{icon}</i>}
          </>
        ) : (
          <>
            {icon && <i className={s.icon}>{icon}</i>}
            {child && <span className={buildClassName(s.label, labelClassName)}>{child}</span>}
          </>
        )}
      </>
    ),
    [child, icon, labelClassName, swap],
  );

  return (
    <button
      aria-busy={loading}
      aria-label={label || 'Action Button'}
      aria-pressed={active}
      className={buttonClassname}
      disabled={disabled || loading}
      title={title}
      onClick={handleClick}
    >
      {startDecorator}
      {renderContent()}
      {endDecorator}
      <RippleEffect />
    </button>
  );
};

export default memo(ActionButton);
