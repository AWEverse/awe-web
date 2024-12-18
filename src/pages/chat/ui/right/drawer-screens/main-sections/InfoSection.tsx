import { Avatar } from '@mui/material';
import { FC, memo } from 'react';

import s from './InfoSection.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import InfoAction from '../../common/InfoAction';

interface OwnProps {
  className?: string;
}

interface StateProps {}

const InfoSection: FC<OwnProps & StateProps> = props => {
  const { className } = props;

  return (
    <section className={buildClassName(s.InfoSection, className)}>
      <Avatar className={s.Avatar} src="https://mui.com/static/images/avatar/1.jpg" sx={{ width: 140, height: 140 }} />
      <div className={s.UserDetails}>
        <h1>John Doe</h1>
        <p>volynetstyle · he/him</p>
        <span>last seen 2 hours ago</span>
      </div>
      <div className={s.Actions}>
        <InfoAction alert="Phone was copied!" startDecorator="📞" subtitle="Phone" title="+1 555 555-5555" />
      </div>
    </section>
  );
};

export default memo(InfoSection);
