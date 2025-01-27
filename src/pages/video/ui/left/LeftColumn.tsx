import { FC } from "react";
import MediaPlayer from "./media-player/MediaPlayer";
import s from "./LeftColumn.module.scss";
import MediaBottomNavigation from "./media-player/MediaBottomNavigation/";
import buildClassName from "@/shared/lib/buildClassName";

interface OwnProps {
  className?: string;
}

const LeftColumn: FC<OwnProps> = (props) => {
  const { className } = props;

  return (
    <section className={buildClassName(className, "space-y-4")}>
      <MediaPlayer>
        <div>Left</div>
      </MediaPlayer>
      <h1 className={s.MediaTitle}>The bottom title will be here</h1>

      <MediaBottomNavigation />
    </section>
  );
};

export default LeftColumn;
