import { FC, memo } from 'react';

import s from './PhoneCall.module.scss';
import PhoneActionButton from '../common/PhoneActionButton';
import { Avatar } from '@mui/material';
import buildStyle from '@/shared/lib/buildStyle';

interface OwnProps {}

interface StateProps {}

const url = 'https://mui.com/static/images/avatar/1.jpg';

const PhoneCall: FC<OwnProps & StateProps> = () => {
  return (
    <div className={s.PhoneCall} style={buildStyle(`--backdrop-img: url(${url})`)}>
      <section className={s.PhoneCallHeader}>
        <h1>Phone call active</h1>
        <span className={s.PhoneCallSecurityStatus}>😉😌😍😂🥰</span>
      </section>
      <section className={s.PhoneCallBody}>
        <Avatar className={s.PhoneCallAvatar} src={url} />
        <time>12:00</time>
      </section>
      <section className={s.PhoneCallContent}>
        <PhoneActionButton>Mute</PhoneActionButton>
        <PhoneActionButton>Call</PhoneActionButton>
        <PhoneActionButton>Speaker</PhoneActionButton>
        <PhoneActionButton>Add</PhoneActionButton>
        <PhoneActionButton>Record</PhoneActionButton>
        <PhoneActionButton>End</PhoneActionButton>
      </section>
      <section className={s.PhoneCallFooter}></section>
    </div>
  );
};

export default memo(PhoneCall);
