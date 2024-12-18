import buildClassName from '@/shared/lib/buildClassName';
import s from './TopicItem.module.scss';
import { WithDecorators } from '@/types/props';
import { FC } from 'react';

interface OwnProps {
  name: string;
  desc?: string;
  posts?: number;
  children?: React.ReactNode;
  postCount?: number;
  className?: string;
  listClassName?: string;
  onClick?: () => void;
}

const TopicItem: FC<OwnProps & WithDecorators> = props => {
  const { name, desc, children, startDecorator, endDecorator, onClick, className, listClassName } = props;

  const classNames = buildClassName(className, s.topicItem);
  const listClassNames = buildClassName(listClassName, s.topicList);

  const noContent = !children && !desc;

  return (
    <div className={classNames} onClick={onClick}>
      {startDecorator}
      {noContent ? (
        <h3 className={s.topicTitle}>{name}</h3>
      ) : (
        <div className={s.topicInfo}>
          <h3 className={s.topicTitle}>{name}</h3>
          <p className={s.topicDesc}>{desc}</p>
          <ul className={listClassNames}>{children}</ul>
        </div>
      )}
      {endDecorator}
    </div>
  );
};

export default TopicItem;
