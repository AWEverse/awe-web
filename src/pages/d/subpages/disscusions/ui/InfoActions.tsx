import { FC, memo } from 'react';
import formatLargeNumber from '@/lib/utils/helpers/number/formatLargeNumber';
import Message01Icon from '@/shared/common/icons/Message01Icon';
import Task01Icon from '@/shared/common/icons/Task01';
import CheckmarkCircle02Icon from '@/shared/common/icons/CheckmarkCircle02';
import IconExpand from '@/shared/ui/IconExpand';
import buildClassName from '@/shared/lib/buildClassName';
import s from './InfoActions.module.scss';

interface OwnProps {
  className?: string;
}

interface InfoActionsItem {
  icon: JSX.Element;
  label: string;
  count: number;
}

interface StateProps {
  item?: InfoActionsItem[];
}

const defaultState: InfoActionsItem[] = [
  {
    icon: <CheckmarkCircle02Icon size={20} title="Answers" />,
    label: 'Replies',
    count: 2,
  },
  {
    icon: <Message01Icon size={20} title="Posts" />,
    label: 'Posts',
    count: 49322,
  },
  {
    icon: <Task01Icon size={20} title="Topics" />,
    label: 'Topics',
    count: 2423,
  },
];

const InfoActions: FC<OwnProps & StateProps> = ({ item = defaultState, className }) => {
  const classes = buildClassName(className, s.wrapper);

  return (
    <div className={classes}>
      {item.map(({ icon, label, count }) => (
        <IconExpand key={label} icon={icon} label={formatLargeNumber(count)} />
      ))}
    </div>
  );
};

export default memo(InfoActions);
