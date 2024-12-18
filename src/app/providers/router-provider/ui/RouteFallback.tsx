import { FC } from 'react';
import s from './RouteFallback.module.css';

const RouteFallback: FC = () => {
  return (
    <div className={s.FallbackContainer}>
      <div className={s.Logo}>AWE</div>
    </div>
  );
};

export default RouteFallback;
