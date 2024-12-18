import s from './index.module.scss';
import LeftColumn from './ui/left/LeftColumn';
import RightColumn from './ui/right/RightColumn';

const VideoPage = () => {
  return (
    <div className={s.VideoRoot} id="videoRoot">
      <LeftColumn className={s.LeftColumn} />
      <RightColumn className={s.RightColumn} />
    </div>
  );
};

export default VideoPage;
