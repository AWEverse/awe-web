import React from 'react';
import { Avatar, Box, Divider } from '@mui/material';
import s from './MemberCard.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface MemberCardProps {
  avatar: string;
  username: string;
  description: string;
  joinDate?: string;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
  avatarSize?: 'small' | 'medium' | 'large';
  className?: string;
}

const avatarSizeMap = {
  small: 32,
  medium: 48,
  large: 64,
};

const MemberCard: React.FC<MemberCardProps> = ({
  avatar,
  username,
  description,
  joinDate,
  startDecorator,
  endDecorator,
  avatarSize = 'medium',
  className,
}) => (
  <Box className={buildClassName(s.memberCard, className)}>
    {startDecorator && (
      <div className={buildClassName(s.memberCard__decorator)}>{startDecorator}</div>
    )}

    <div className={s.memberCard__content}>
      <Avatar
        alt={username}
        src={avatar}
        sx={{ width: avatarSizeMap[avatarSize], height: avatarSizeMap[avatarSize] }}
      />
      <div className={s.memberCard__info}>
        <p className="awe-title">{username}</p>
        <p className="awe-subtitle">{description}</p>
      </div>
    </div>

    {endDecorator && <div className={buildClassName(s.memberCard__decorator)}>{endDecorator}</div>}

    {joinDate && (
      <Divider textAlign="right" className={s.memberCard__divider}>
        {joinDate}
      </Divider>
    )}
  </Box>
);

export default MemberCard;
export type { MemberCardProps };
