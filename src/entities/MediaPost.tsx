import { FC } from 'react';
import s from './MediaPost.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import { Avatar } from '@mui/material';
import {
  BookmarkAddRounded,
  CommentRounded,
  FavoriteBorder,
  FavoriteBorderRounded,
  FavoriteRounded,
  SendRounded,
} from '@mui/icons-material';
import IconButton from '@/shared/ui/IconButton';

interface OwnProps {}

interface StateProps {}

const MediaPost: FC<OwnProps & StateProps> = () => {
  return (
    <article className={s.MediaPost}>
      <section className={buildClassName('awe-user', s.MediaPostHeader)}>
        <Avatar alt="" className={buildClassName('awe-avatar', s.MediaAvatar)} src="https://mui.com/static/images/avatar/1.jpg" />
        <p className="awe-title">Algdisfiasi</p>
        <div className="awe-subtitle">
          <p>laslasf</p>
          <span className="span">12 min ago</span>
        </div>
      </section>

      <section className={s.MediaPostBody}>
        <div className={s.MediaContent}>
          <img alt="" className={s.MediaImage} src="https://m.media-amazon.com/images/I/61rwipF7RFL._AC_UF1000,1000_QL80_.jpg" />
        </div>
        <div className={s.MediaActions}>
          <div className={s.MediaAction}>
            <IconButton>
              <FavoriteBorderRounded />
            </IconButton>

            <span>124</span>
          </div>
          <div className={s.MediaAction}>
            <IconButton>
              <CommentRounded />
            </IconButton>
            <span>124</span>
          </div>

          <div className={s.MediaAction}>
            <IconButton>
              <SendRounded />
            </IconButton>
            <span>124</span>
          </div>
          <div className={s.MediaAction}>
            <IconButton>
              <BookmarkAddRounded />
            </IconButton>
            <span>124</span>
          </div>
        </div>
      </section>
    </article>
  );
};

export default MediaPost;
