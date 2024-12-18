import { FC, ReactNode } from 'react';
import buildClassName from '../lib/buildClassName';

import s from './IconExpand.module.scss';

interface OwnProps {
  className?: string;
  icon: ReactNode;
  label?: ReactNode;
  checked?: boolean;
  onClick?: () => void;
}

const IconExpand: FC<OwnProps> = props => {
  const { icon, label, className, checked, onClick } = props;

  const classNames = buildClassName(s.iconContainer, className);

  return (
    <div className={classNames} data-open={`${checked ?? false}`} tabIndex={0} onClick={onClick}>
      <span className={s.iconSVG}>{icon}</span>
      <span className={s.iconLabel}>{label}</span>
    </div>
  );
};

export default IconExpand;
