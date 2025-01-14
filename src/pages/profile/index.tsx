import { FC } from 'react';
import HeaderSection from './ui/HeaderSection';

import s from './index.module.scss';
import buildClassName from '@/shared/lib/buildClassName';
import ProfileDescription from './ui/ProfileDescription';
import { MediaTabs } from '@/widgets/media-tabs';

interface OwnProps {}

interface StateProps {}

const ProfilePage: FC<OwnProps & StateProps> = () => {
  return (
    <div data-scrollable="true" className={buildClassName(s.ProfileRoot)} id="profile page">
      <HeaderSection />
      <ProfileDescription />
      {/* <MediaTabs /> */}
    </div>
  );
};

export default ProfilePage;
