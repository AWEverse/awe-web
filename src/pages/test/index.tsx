import ContextMenu from "@/entities/context-menu/public/ContextMenu";
import { EMouseButton } from "@/lib/core";
import useContextMenuHandlers from "@/entities/context-menu/public/hooks/useContextMenuHandlers";
import useMenuPosition, {
  MenuPositionOptions,
} from "@/entities/context-menu/public/hooks/useMenuPosition";
import { useFastClick } from "@/shared/hooks/mouse/useFastClick";
import { useState, useRef } from "react";
import Video from "@/shared/ui/Video";

const TestPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return <Video src="https://www.w3schools.com/html/mov_bbb.mp4" canPlay />;
};

export default TestPage;
