import { FC, memo, ReactNode } from "react";
import { VideoPlayer } from "@/widgets/video-player";

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const MediaPlayer: FC<OwnProps & StateProps> = () => {
  return (
    <VideoPlayer
      audioVolume={0}
      isAudioMuted={false}
      playbackSpeed={0}
      totalFileSize={0}
    />
  );
};

export default memo(MediaPlayer);
