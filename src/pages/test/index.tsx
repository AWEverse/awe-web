import React from "react";
import "./styles.scss";
import AnimatedList from "@/shared/ui/AnimatedList";
import { requestMeasure, requestMutation } from "@/lib/modules/fastdom";
import { fastRaf } from "@/lib/core";

const TestPage: React.FC = () => {
  fastRaf(() => console.log("First added"), true);
  fastRaf(() => console.log("Second added"), true);
  fastRaf(() => console.log("Third added"), true);

  return <></>;
};

export default TestPage;
