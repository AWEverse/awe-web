import {
  FC,
  ReactNode,
  useCallback,
  useRef,
  CSSProperties,
  useMemo,
  memo,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";
import stopEvent from "@/lib/utils/stopEvent";
import useMenuPosition from "@/entities/context-menu/public/hooks/useMenuPosition";
import Portal from "@/shared/ui/Portal";
import { useClickAway } from "@/lib/hooks/events/useClick";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";

import "./ContextMenu.scss";
import { useEffectWithPreviousDeps } from "@/shared/hooks/effects/useEffectWithPreviousDependencies";
import { dispatchHeavyAnimation, IVector2 } from "@/lib/core";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import useKeyboardListeners from "@/lib/hooks/events/useKeyboardListeners";
import { useStableCallback } from "@/shared/hooks/base";

const ANIMATION_DURATION = 0.125;

const ANIMATION_PROPS = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { duration: ANIMATION_DURATION },
};

interface OwnProps {
  isOpen: boolean;
  position: IVector2;
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

const ContextMenu: FC<OwnProps> = ({
  isOpen,
  position,
  children,
  className,
  menuClassName,
  style,
  withPortal,
  isDense,
  noCompact = false,
  triggerRef,
  onClose,
  onCloseAnimationEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useBodyClass("has-open-dialog", isOpen);

  useClickAway(containerRef, onClose);

  useKeyboardListeners({ onEsc: onClose });

  const getTriggerElement = useStableCallback(
    () => triggerRef?.current || document.body,
  );
  const getRootElement = useStableCallback(() => containerRef.current);
  const getMenuElement = useStableCallback(() => bubbleRef.current);
  const getLayout = useStableCallback(() => ({
    isDense,
    shouldAvoidNegativePosition: true,
    withPortal: true,
    menuElMinWidth: noCompact ? 220 : 120,
  }));

  useMenuPosition(isOpen, containerRef, bubbleRef, {
    anchor: position,
    getTriggerElement,
    getRootElement,
    getMenuElement,
    getLayout,
    withMaxHeight: true,
  });

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
        return dispatchHeavyAnimation(ANIMATION_DURATION);
      }
    },
    [isOpen],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("scroll", handleClose, true);
    } else {
      document.removeEventListener("scroll", handleClose, true);
    }

    return () => {
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [isOpen, handleClose]);

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
export { type OwnProps as ContextMenuProps };
