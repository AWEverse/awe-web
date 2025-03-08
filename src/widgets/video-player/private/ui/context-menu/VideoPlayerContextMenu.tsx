import ContextMenu from "@/entities/context-menu";
import { ContextMenuProps } from "@/entities/context-menu/public/ContextMenu";
import { useStableCallback } from "@/shared/hooks/base";
import { AnimatePresence, motion } from "motion/react";
import { FC, useState, memo } from "react";
import MenuMain, { type ActionType } from "./screens/MenuMain";
import buildClassName from "@/shared/lib/buildClassName";

import s from "./VideoPlayerContextMenu.module.scss";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";

interface VideoPlayerContextMenuProps
  extends Omit<ContextMenuProps, "children"> {}

type Screen = "Main";

const ANIMATION_DURATION = 0.125;

const VideoPlayerContextMenu: FC<VideoPlayerContextMenuProps> = (props) => {
  const isMobile = useAppLayout((state) => state.isMobile);

  const [screen, setScreen] = useState<Screen>("Main");

  const handleActionChange = useStableCallback((action: ActionType) => {});

  const isMain = screen === "Main";
  const initialX = isMain ? "-100%" : "100%";
  const exitX = initialX;

  return (
    <ContextMenu {...props} animations={{ layout: "size" }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={screen}
          className={s.ContextMenuActions}
          initial={{ x: initialX }}
          animate={{ x: 0 }}
          exit={{ x: exitX }}
          transition={{
            duration: ANIMATION_DURATION,
          }}
        >
          {
            {
              Main: <MenuMain onClickAction={handleActionChange} />,
            }[screen]
          }
        </motion.div>
      </AnimatePresence>

      {!isMobile && (
        <div className={buildClassName("key-container", s.keyNavigation)}>
          <div className="key-item">
            <kbd className="key-button">↨</kbd>
            <span className="key-label">Jump</span>
          </div>
          <div className="key-item">
            <kbd className="key-button">↵</kbd>
            <span className="key-label">Enter</span>
          </div>
        </div>
      )}
    </ContextMenu>
  );
};

export default memo(VideoPlayerContextMenu);
