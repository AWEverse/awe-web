import buildClassName from '@/shared/lib/buildClassName';
import RippleEffect from '@/shared/ui/ripple-effect';
import { Avatar } from '@mui/material';
import { FC, memo } from 'react';

import s from './ContactResult.module.scss';

interface OwnProps {
  href?: string;
  className?: string;
  onClick?: () => void;
}

const ContantResult: FC<OwnProps> = props => {
  const { href, className, onClick } = props;

  const ButtonTag = href ? 'a' : 'button';

  return (
    <ButtonTag
      className={buildClassName('awe-user', 'awe-user-actions', className, s.ContactResult)}
      href={href}
      onClick={onClick}
    >
      <Avatar alt="" className="awe-avatar" src="https://picsum.photos/200" />
      <p className="awe-title awe-overflow-ellipsis">Albinchik</p>
      <span className="awe-subtitle awe-overflow-ellipsis">Last seen 14:33</span>
      <RippleEffect />
    </ButtonTag>
  );
};

export default memo(ContantResult);
