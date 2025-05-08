import { FC, ReactNode } from "react";

import s from "./CommunityBody.module.scss";
import {
  AccordionSwiftGroup,
  AccordionSwiftItem,
} from "@/shared/ui/accordion-swift";

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const CommunityBody: FC<OwnProps & StateProps> = () => {
  return (
    <div className={s.communityLayout}>
      <div className={s.communityContent}>
        <AccordionSwiftGroup>
          <AccordionSwiftItem index={0} title={"Forum highlights"}>
            asflsaflasllsaf
          </AccordionSwiftItem>
        </AccordionSwiftGroup>
        <h2>Main Content</h2>
        <p>This area stays centered and resizes nicely.</p>
      </div>
      <div className={s.communitySidebar}>
        <h3>Sidebar</h3>
        <p>Supplemental info (visible on desktop).</p>
      </div>
    </div>
  );
};

export default CommunityBody;
