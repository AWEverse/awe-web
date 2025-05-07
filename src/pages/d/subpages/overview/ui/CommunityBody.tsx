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

          <AccordionSwiftItem index={1} title={"Forum highlights"}>
            asflsaflasllsafdsadasdsa d as d asd as d asd as dsa
            asflsaflasllsafdsadasdsa d as d asd as d asd as dsa Lorem ipsum
            dolor, sit amet consectetur adipisicing elit. Nisi esse excepturi
            quo, magnam est quod dolorum magni tenetur culpa laborum itaque nemo
            molestiae architecto nihil eum possimus voluptas dicta neque!
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
