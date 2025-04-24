import s from "./index.module.scss";

import CommunityHeader from "./ui/CommunityHeader";
import CommunityActions from "./ui/CommunityActions";
import CommunityRecomendations from "./ui/CommunityRecomendations";
import CommunityBody from "./ui/CommunityBody";
import CommunityFooter from "./ui/CommunityFooter";
import CommunityPinnedBody from "./ui/CommunityPinnedBody";
import CommunityTerms from "./ui/CommunityTerms";

const OverviewPage: React.FC = () => {
  return (
    <div className={s.communityRoot}>
      <CommunityHeader />
      <CommunityActions />
      <CommunityRecomendations />

      <div className={s.CommunityHome}>
        <section data-placement="left">
          <CommunityPinnedBody />
          <CommunityBody />
          <CommunityFooter />
          <CommunityTerms
            communityName="Any name"
            links={[
              { label: "Terms", href: "#terms" },
              { label: "Privacy", href: "#privacy" },
              { label: "Security", href: "#security" },
              { label: "Status", href: "#status" },
              { label: "Docs", href: "#docs" },
              { label: "Contact", href: "#contact" },
              { label: "Manage cookies", href: "#cookies" },
              {
                label: "Do not share my personal information",
                href: "#do-not-share",
              },
            ]}
          />
        </section>
        <section data-placement="right"></section>
      </div>
    </div>
  );
};

export default OverviewPage;
