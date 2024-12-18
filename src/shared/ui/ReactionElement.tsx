import { ReactNode } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';

import s from './ReactionElement.module.scss';
import buildClassName from '../lib/buildClassName';

export interface ReactionElementProps {
  icon: ReactNode | string;
  reactions: number;
  avatar: string;
  active?: boolean;
  onClick?: () => void;
}

const ReactionElement: React.FC<ReactionElementProps> = ({ icon, reactions, avatar, onClick }) => {
  const handleChipClick = () => {
    onClick?.();
  };

  const classNames = buildClassName(s.ReactionElement, s.button);

  return (
    <button className={classNames} onClick={handleChipClick}>
      <span className={s.startDecorator}>{icon}</span>
      <span className={s.endDecorator}>
        {1 <= reactions && reactions <= 3 ? (
          <AvatarGroup>
            {Array.from({ length: reactions }).map((_, index) => (
              <Avatar key={index} className={s.avatar} src={avatar} />
            ))}
          </AvatarGroup>
        ) : (
          <Typography className={s.reactionsCount} component={'span'}>
            {reactions}
          </Typography>
        )}
      </span>
    </button>
  );
};

export default ReactionElement;
