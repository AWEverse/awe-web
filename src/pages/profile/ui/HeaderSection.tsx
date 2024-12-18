import { Avatar, Badge, Button } from '@mui/material';
import { FC } from 'react';

import s from './HeaderSection.module.scss';
import { MessageRounded } from '@mui/icons-material';
import buildStyle from '@/shared/lib/buildStyle';

interface HeaderSectionProps {}

const BACKDROP_URL =
  'https://fedtechmagazine.com/sites/fedtechmagazine.com/files/2021-06/70-700x120.jpg';
const AVATAR_URL = 'https://i.pinimg.com/736x/03/aa/a9/03aaa96960495607f70e76e580612f19.jpg';

const HeaderSection: FC<HeaderSectionProps> = () => {
  return (
    <section className={s.headerWrapper}>
      <figure
        className={s.headerPicture}
        style={buildStyle(`--backdrop-img: url(${BACKDROP_URL})`)}
      >
        <img draggable={false} src={BACKDROP_URL} alt="Background" />
        <figcaption>
          Got that picture on <a href="#">Pinterest</a>
        </figcaption>
      </figure>

      <div className={s.headerTitle}>
        <Badge
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={4}
          color="success"
          overlap="circular"
          sx={{ width: 140, height: 140 }}
        >
          <Avatar className={s.headerAvatar} src={AVATAR_URL} sx={{ width: 140, height: 140 }} />
        </Badge>

        <div className={s.headerInfo}>
          <div className={s.headerName}>
            <h1>Andrii Volynets</h1>

            <div className={s.headerActions}>
              <Button size="small" startIcon={<MessageRounded />} variant="contained">
                Message
              </Button>
              <Button size="small" startIcon={<MessageRounded />} variant="contained">
                Follow
              </Button>
            </div>
          </div>

          <div className={s.headerDescription}>
            <p className={s.descriptionText} data-max-length={255}>
              Я не буду думать об этом сегодня. Я подумаю об этом завтра.
            </p>
            <span>
              <a href="#" className="awe-link-primary awe-link ">
                4 posts
              </a>{' '}
              •{' '}
              <a href="#" className="awe-link-primary awe-link ">
                42 followers
              </a>{' '}
              •{' '}
              <a href="#" className="awe-link-primary awe-link ">
                1 following
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
