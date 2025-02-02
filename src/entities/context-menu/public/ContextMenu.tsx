import {
  FC,
  ReactNode,
  useCallback,
  useRef,
  CSSProperties,
  useMemo,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IVector2D } from "@/lib/utils/data-structures/Vector2d";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useMenuPosition from "@/entities/context-menu/public/hooks/useMenuPosition";
import Portal from "@/shared/ui/Portal";
import { useClickAway } from "@/lib/hooks/history/events/useClick";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";

import "./ContextMenu.scss";
import { useEffectWithPreviousDeps } from "@/shared/hooks/effects/useEffectWithPreviousDependencies";
import { dispatchHeavyAnimation } from "@/lib/core";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";

const ANIMATION_DURATION = 0.125;

const ANIMATION_PROPS = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { duration: ANIMATION_DURATION },
};

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
  triggerRef?: React.RefObject<HTMLElement | null>;
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
  triggerRef,
  onClose,
  onCloseAnimationEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    document.removeEventListener("scroll", handleClose, true);
  }, [onClose]);

  const positionConfig = useMemo(
    () => ({
      anchor: position,
      getTriggerElement: () => triggerRef?.current || document.body,
      getRootElement: () => containerRef.current,
      getMenuElement: () => bubbleRef.current,
      getLayout: () => ({
        isDense,
        shouldAvoidNegativePosition: true,
        withPortal: true,
        menuElMinWidth: noCompact ? 220 : 160,
      }),
      withMaxHeight: true,
    }),
    [position, isDense, noCompact, triggerRef],
  );

  useClickAway(containerRef, onClose);

  useBodyClass("has-open-dialog", isOpen);

  useMenuPosition(isOpen, containerRef, bubbleRef, positionConfig);

  useBoundaryCheck({
    elementRef: containerRef,
    isActive: isOpen,
    onExit: onClose,
    position,
    extraPaddingX: 0,
    options: { outboxSize: 60, throttleInterval: 250 },
  });

  useEffectWithPreviousDeps(
    ([wasOpen]) => {
      if (isOpen !== wasOpen) {
        dispatchHeavyAnimation(ANIMATION_DURATION);
      }
    },
    [isOpen],
  );

  const menuEl = useMemo(
    () => (
      <motion.div
        key={"context-menu"}
        ref={containerRef}
        className={buildClassName("context-menu-container", className)}
        style={style}
        {...ANIMATION_PROPS}
        onAnimationEnd={onCloseAnimationEnd}
      >
        <div
          className={buildClassName("context-menu-bubble", menuClassName)}
          ref={bubbleRef}
          onContextMenu={stopEvent}
        >
          {children}
        </div>
      </motion.div>
    ),
    [className, menuClassName, style, children, onCloseAnimationEnd],
  );

  return (
    <AnimatePresence>
      {isOpen && (withPortal ? <Portal>{menuEl}</Portal> : menuEl)}
    </AnimatePresence>
  );
};

export default memo(ContextMenu);
