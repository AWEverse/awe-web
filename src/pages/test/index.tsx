import {
  AccordionSwiftGroup,
  AccordionSwiftItem,
} from "@/shared/ui/accordion-swift";
import { FC, ReactNode } from "react";

interface OwnProps {}

interface StateProps {}

const TestPage: FC<OwnProps & StateProps> = () => {
  return (
    <div style={{ padding: "10px" }}>
      <AccordionSwiftGroup allowMultiple>
        <AccordionSwiftItem title={"First accordion 1"}>
          1) Lorem ipsum dolor sit, amet consectetur adipisicing elit.
          Laudantium, consequuntur. Consequuntur ratione repellat assumenda odio
          earum recusandae eaque excepturi cupiditate, dolore iure! Tempora quae
          culpa quia obcaecati et illo praesentium?
        </AccordionSwiftItem>
        <AccordionSwiftItem title={"First accordion 2"}>
          2) Lorem ipsum dolor sit, amet consectetur adipisicing elit.
          Laudantium, consequuntur. Consequuntur ratione repellat assumenda odio
          earum recusandae eaque excepturi cupiditate, dolore iure! Tempora quae
          culpa quia obcaecati et illo praesentium? Lorem ipsum dolor sit, amet
          consectetur adipisicing elit. Laudantium, consequuntur. Consequuntur
          ratione repellat assumenda odio earum recusandae eaque excepturi
          cupiditate, dolore iure! Tempora quae culpa quia obcaecati et illo
          praesentium?
        </AccordionSwiftItem>
        <AccordionSwiftItem title={"First accordion 3"}>
          3) Lorem ipsum dolor sit, amet consectetur adipisicing elit.
          Laudantium, consequuntur. Consequuntur ratione repellat assumenda odio
          earum recusandae eaque excepturi cupiditate, dolore iure! Tempora quae
          culpa quia obcaecati et illo praesentium?
        </AccordionSwiftItem>
      </AccordionSwiftGroup>
    </div>
  );
};

export default TestPage;
