import buildClassName from '@/shared/lib/buildClassName';
import { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import IconExpand from '@/shared/ui/IconExpand';
import { VolunteerActivismSharp } from '@mui/icons-material';
import formatLargeNumber from '@/lib/utils/helpers/number/formatLargeNumber';
import CheckmarkCircle02Icon from '@/shared/common/icons/CheckmarkCircle02';

import s from './HelpfulRatingItem.module.scss';

const TopPlaces: Record<number, string> = {
  0: 'otherPlace',
  1: 'firstPlace',
  2: 'secondPlace',
  3: 'thirdPlace',
};

interface OwnProps {
  className?: string;
  src?: string;
  username?: string;
  answers?: number;
  rating?: number;
  placeIndex?: number;
  onClick?: () => void;
}

const HelpfulRatingItem: FC<OwnProps> = ({ className, src, username, answers, rating, placeIndex = 2, onClick }) => {
  const classNames = buildClassName(s.userItem, className);
  const topPlacesClassNames = buildClassName(s.topPlaces, s[TopPlaces[placeIndex]]);

  const handleClick = () => {
    onClick?.();
  };

  return (
    <li className={classNames} data-place={placeIndex} onClick={handleClick}>
      <span className={topPlacesClassNames}></span>

      <div className={s.userActions}>
        <Avatar src={src} sx={{ width: 24, height: 24 }} />
        <p>{username}</p>
      </div>

      <div className={s.userActions}>
        <IconExpand className={s.actionItem} icon={<CheckmarkCircle02Icon />} label={formatLargeNumber(answers)} />
        <IconExpand className={s.actionItem} icon={<VolunteerActivismSharp />} label={formatLargeNumber(rating)} />
      </div>
    </li>
  );
};

export default HelpfulRatingItem;
