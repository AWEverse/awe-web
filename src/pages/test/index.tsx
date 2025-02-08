import ContextMenu from "@/entities/context-menu/public/ContextMenu";
import { EMouseButton } from "@/lib/core";
import useContextMenuHandlers from "@/entities/context-menu/public/hooks/useContextMenuHandlers";
import useMenuPosition, {
  MenuPositionOptions,
} from "@/entities/context-menu/public/hooks/useMenuPosition";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import { useState, useRef } from "react";
import Video from "@/shared/ui/Video";
import SlideButton from "@/entities/SlideButton";
import {
  requestMeasure,
  requestMutation,
  requestNextMutation,
} from "@/lib/modules/fastdom/fastdom";

const TestPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SlideButton>
      <p>1 20 0210rfwf</p>
      <p>2 20 0210rfwвфівфівf</p>
      <p>3 20 0210rfwf</p>
      <p>4 20 0210rfwf</p>
      <p>5 20 0210rfwf</p>
      <p>6 20 0210rfwвфівфівf</p>
      <p>7 20 0210rfwf</p>
      <p>8 20 0210rfwf</p>
      <p>9 20 0210rfwf</p>
      <p>10 20 0210rfwвфівфівf</p>
      <p>11 20 0210rfwf</p>
      <p>12 20 0210rfwf</p>
    </SlideButton>
  );
};

export default TestPage;
