import { FC } from "react";
import HeaderSection from "./ui/HeaderSection";

import s from "./index.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import ProfileDescription from "./ui/ProfileDescription";
import { MediaTabs } from "@/widgets/media-tabs";
import MediaPost from "@/entities/MediaPost";
import MediaFeed from "@/widgets/media-feed";

interface OwnProps {}

interface StateProps {}

const ProfilePage: FC<OwnProps & StateProps> = () => {
  return (
    <div
      data-scrollable="true"
      className={buildClassName(s.ProfileRoot)}
      id="profile page"
    >
      <HeaderSection />
      <ProfileDescription />
      {/* <MediaTabs /> */}
      <section>
        <MediaFeed />
      </section>
    </div>
  );
};

export default ProfilePage;
