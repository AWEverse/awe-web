import { WithDecorators } from '@/types/props';
import buildClassName from '@/shared/lib/buildClassName';

import s from './CategoryTitle.module.scss';
import { FC } from 'react';
import { Chip } from '@mui/material';
import formatLargeNumber from '@/lib/utils/helpers/number/formatLargeNumber';

interface OwnProps {
  name: string;
  desc: string;
  posts?: number | string;
  className?: string;
  onClick?: () => void;
}

const CategoryTitle: FC<OwnProps & WithDecorators> = props => {
  const { name, desc, posts, startDecorator, endDecorator, className, onClick } = props;

  const classNames = buildClassName(s.CategoryTitle, className);

  return (
    <div className={classNames} onClick={onClick}>
      {startDecorator}
      <div className={s.title}>
        <h1>
          <span>{name}</span>
          <Chip
            className={s.postCount}
            color="primary"
            label={formatLargeNumber(Number(posts))}
            size="small"
            variant="outlined"
          />
        </h1>
        <p>{desc}</p>
      </div>
      {endDecorator}
    </div>
  );
};

export default CategoryTitle;
