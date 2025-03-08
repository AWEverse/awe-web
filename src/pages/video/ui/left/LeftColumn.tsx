import { FC } from "react";
import s from "./LeftColumn.module.scss";
import MediaBottomNavigation from "./media-player/MediaBottomNavigation/";
import buildClassName from "@/shared/lib/buildClassName";
import { VideoPlayer } from "@/widgets/video-player";

interface OwnProps {
  className?: string;
}

const LeftColumn: FC<OwnProps> = (props) => {
  const { className } = props;

  return (
    <section className={buildClassName(className, "space-y-4")}>
      <VideoPlayer
        audioVolume={0}
        isAudioMuted={false}
        playbackSpeed={0}
        totalFileSize={0}
      />
      <h1 className={s.MediaTitle}>The bottom title will be here</h1>

      <MediaBottomNavigation />
    </section>
  );
};

export default LeftColumn;
