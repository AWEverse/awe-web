import { FC, ReactNode } from 'react';

import s from './HeaderContainer.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface OwnProps {
  children: ReactNode;
  className?: string;
}

const HeaderContainer: FC<OwnProps> = ({ children, className }) => {
  return <div className={buildClassName(s.HeaderContainer, className)}>{children}</div>;
};

export default HeaderContainer;
