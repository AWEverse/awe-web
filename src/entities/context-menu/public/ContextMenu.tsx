import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestNextMutation } from "@/lib/modules/fastdom/fastdom";
import { IVector2D } from "@/lib/utils/data-structures/Vector2d";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useMenuPosition from "@/shared/hooks/DOM/useMenuPosition";

import "./ContextMenu.scss";
import { useClickAway } from "@/lib/hooks/history/events/useClick";
import Portal from "@/shared/ui/Portal";

interface ContextMenuProps {
  isOpen: boolean;
  position: IVector2D;
  children: ReactNode;
  className?: string;
  menuClassName?: string;
  style?: CSSProperties;
  withPortal?: boolean;
  isDense?: boolean;
  noCompact?: boolean;
  rootRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
}

const ContextMenu: FC<ContextMenuProps> = ({
  isOpen,
  position,
  children,
  className,
  menuClassName,
  style,
  withPortal,
  isDense,
  noCompact,
  rootRef,
  onClose,
  onCloseAnimationEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useMenuPosition(isOpen, containerRef, bubbleRef, {
    anchor: position,
    getTriggerElement: () => rootRef?.current || document.body,
    getRootElement: () => containerRef.current,
    getMenuElement: () => bubbleRef.current,
    getLayout: () => ({
      isDense,
      shouldAvoidNegativePosition: true,
      withPortal,
      menuElMinWidth: noCompact ? 220 : 160,
    }),
    withMaxHeight: true,
  });

  const handleClose = useCallback(() => {
    onClose();
    document.removeEventListener("scroll", handleClose, true);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => e.key === "Escape" && handleClose(),
    [handleClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("scroll", handleClose, true);
    } else {
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [isOpen, handleKeyDown, handleClose]);

  useClickAway(bubbleRef, handleClose);

  return (
    isOpen && (
      <Portal>
        <div
          ref={containerRef}
          className={buildClassName("context-menu-container", className)}
          style={style}
        >
          <div
            className={buildClassName("context-menu-bubble", menuClassName)}
            ref={bubbleRef}
          >
            {children}
          </div>
        </div>
      </Portal>
    )
  );
};

export default ContextMenu;
