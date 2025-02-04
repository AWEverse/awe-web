import s from "./index.module.scss";

import CommunityHeader from "./ui/CommunityHeader";
import CommunityActions from "./ui/CommunityActions";
import CommunityRecomendations from "./ui/CommunityRecomendations";

const OverviewPage: React.FC = () => {
  return (
    <div className={s.root}>
      <CommunityHeader />
      <CommunityActions />

      <CommunityRecomendations />
    </div>
  );
};

export default OverviewPage;
