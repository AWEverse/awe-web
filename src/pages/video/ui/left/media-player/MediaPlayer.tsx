import { FC, ReactNode } from 'react';
import s from './MediaPlayer.module.scss';

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const MediaPlayer: FC<OwnProps & StateProps> = () => {
  return (
    <div id="MediaPlayer">
      <video autoPlay loop muted className={s.MediaVideo} src="https://media.w3.org/2010/05/sintel/trailer.mp4"></video>
    </div>
  );
};

export default MediaPlayer;
