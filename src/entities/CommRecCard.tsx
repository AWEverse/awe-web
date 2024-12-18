import { FC } from 'react';
import { Avatar } from '@mui/material';
import buildClassName from '@/shared/lib/buildClassName';

import s from './CommRecCard.module.scss';

interface OwnProps {
  className?: string;
  avatarClasses?: string;
  title?: string;
  value?: string | number;
  desc?: string;
  avatarSrc?: string;
  onClick?: () => void;
  onAvatarClick?: () => void;
}

const CommRecCard: FC<OwnProps> = props => {
  const { className, avatarClasses, title, value, desc, avatarSrc, onClick, onAvatarClick } = props;

  const rootClassNames = buildClassName(s.stats, s.shadow, className);
  const avatarClassNames = buildClassName(s.avatar, avatarClasses);

  return (
    <div className={rootClassNames} onClick={onClick}>
      <Avatar className={avatarClassNames} src={avatarSrc} onClick={onAvatarClick} />
      <div className={s.stat}>
        <div className={s.statTitle}>{title}</div>
        <div className={s.statValue}>{value}</div>
        <div className={s.statDesc}>{desc}</div>
      </div>
    </div>
  );
};

export default CommRecCard;
