import {
  FC,
  ReactNode,
  useCallback,
  useRef,
  CSSProperties,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IVector2D } from "@/lib/utils/data-structures/Vector2d";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useMenuPosition from "@/shared/hooks/DOM/useMenuPosition";

import "./ContextMenu.scss";
import { useClickAway } from "@/lib/hooks/history/events/useClick";
import Portal from "@/shared/ui/Portal";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";

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
  const [isHovered, setIsHovered] = useState(false);

  useMenuPosition(isOpen, containerRef, bubbleRef, {
    anchor: position,
    getTriggerElement: () => rootRef?.current || document.body,
    getRootElement: () => containerRef.current,
    getMenuElement: () => bubbleRef.current,
    getLayout: () => ({
      isDense,
      shouldAvoidNegativePosition: true,
      withPortal: true,
      menuElMinWidth: noCompact ? 220 : 160,
    }),
    withMaxHeight: true,
  });

  const handleClose = useCallback(() => {
    onClose();
    document.removeEventListener("scroll", handleClose, true);
  }, [onClose]);

  useClickAway(bubbleRef, handleClose);

  useBoundaryCheck({
    elementRef: containerRef,
    isActive: isOpen,
    onExit: handleClose,
    options: {
      outboxSize: 100,
      throttleInterval: 100,
    },
  });

  const menuEl = (
    <motion.div
      ref={containerRef}
      className={buildClassName("context-menu-container", className)}
      style={style}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      onContextMenu={stopEvent}
    >
      <div
        className={buildClassName("context-menu-bubble", menuClassName)}
        ref={bubbleRef}
      >
        {children}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (withPortal ? <Portal>{menuEl}</Portal> : menuEl)}
    </AnimatePresence>
  );
};

export default ContextMenu;
