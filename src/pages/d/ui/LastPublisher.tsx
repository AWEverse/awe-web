import { FC } from 'react';

import Linkify from '@/shared/ui/Linkify';
import { Avatar } from '@mui/material';
import buildClassName from '@/shared/lib/buildClassName';

import s from './LastPublisher.module.scss';

type OwnProps = {
  publisherClassName?: string;
  avatarSrc?: string;
  title?: string;
  dateText?: string;
  className?: string;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
};

const LastPublisher: FC<OwnProps> = props => {
  const {
    title,
    dateText,
    avatarSrc,
    startDecorator,
    endDecorator,
    className,
    publisherClassName,
  } = props;

  const renderAvatars = () => {
    if (!avatarSrc) {
      return null;
    }

    return (
      <div className={buildClassName(s.publisher, publisherClassName)}>
        <Avatar
          sizes="small"
          alt="Avatar"
          className={buildClassName(s.avatar, 'awe-avatar')}
          src={avatarSrc}
        />
        <div className={s.info}>
          <p className={s.title}>{title}</p>
          <span className={s.date}>
            <Linkify text={dateText} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={buildClassName(s.wrapper, className)}>
      {startDecorator}
      {renderAvatars()}
      {endDecorator}
    </div>
  );
};

export default LastPublisher;
