import buildClassName from '@/shared/lib/buildClassName';
import ActionButton from '@/shared/ui/ActionButton';
import { Avatar } from '@mui/material';
import { FC } from 'react';
import s from './FirstSlide.module.scss';

interface OwnProps {}

interface StateProps {}

const FirstSlide: FC<OwnProps & StateProps> = () => {
  return (
    <>
      <div className={buildClassName('awe-user', s.user)}>
        <Avatar
          className={buildClassName('awe-avatar', s.avatar)}
          src="https://image.api.playstation.com/vulcan/ap/rnd/202109/1518/PQbJo2xmwHkkhaHmpBH0sD5q.png"
        />

        <p className="awe-title">Crysis 4 is coming</p>
        <p className="awe-subtitle">63K views • 2 months ago</p>
      </div>
      <ActionButton>Play</ActionButton>
    </>
  );
};

export default FirstSlide;
