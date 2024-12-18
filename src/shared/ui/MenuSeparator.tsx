import { FC } from 'react';
import buildClassName from '../lib/buildClassName';
import s from './MenuSeparator.module.scss';

type OwnProps = {
  className?: string;
  size?: 'thin' | 'thick' | 'thicker';
  direction?: 'horizontal' | 'vertical';
  variant?: 'primary' | 'secondary' | 'divider';
};

const MenuSeparator: FC<OwnProps> = ({
  className,
  size = 'thin',
  direction = 'horizontal',
  variant = 'secondary',
}) => {
  const isHorizontal = direction === 'horizontal';

  const Separator = isHorizontal ? 'hr' : 'div';

  return (
    <Separator
      data-variant={variant}
      className={buildClassName(s.root, s[size], s[variant], s[direction], className)}
      aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
      role={!isHorizontal ? 'separator' : undefined}
    />
  );
};

export default MenuSeparator;
