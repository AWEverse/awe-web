import { FC, ReactNode } from 'react';
import SeekLine from './SeekLine';
import VideoPlayer from './VideoPlayer';

import s from './MediaPlayer.module.scss';

interface OwnProps {}

const MediaPlayer: FC<OwnProps> = () => {
  return (
    <div className={s.MediaPlayer}>
      <VideoPlayer audioVolume={0} isAudioMuted={false} playbackSpeed={0} totalFileSize={0} />
      <SeekLine
        duration={120}
        bufferedRanges={[]}
        playbackRate={10}
        isReady={false}
        onSeek={function (position: number): void {
          throw new Error('Function not implemented.');
        }}
        onSeekStart={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

export default MediaPlayer;
