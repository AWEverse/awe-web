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
import { IVector2 } from "@/lib/core";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import useKeyboardListeners from "@/lib/hooks/events/useKeyboardListeners";
import { useStableCallback } from "@/shared/hooks/base";

// Animation constants for the context menu
const ANIMATION_DURATION = 0.125;
const ANIMATION_PROPS = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.85 },
  transition: { duration: ANIMATION_DURATION },
};

export type ContextMenuOptionType<T> = Readonly<{
  description?: string;
  icon?: string;
  label: string;
  group?: string;
  onClick: (value?: T) => unknown;
  value?: T;
}>;

type RenderButtonProps = Readonly<{
  ref: React.Ref<HTMLButtonElement> | null;
  onClick: (ev: React.MouseEvent) => void;
  onKeyDown: (ev: KeyboardEvent) => void;
  isMenuShowing: boolean;
  menuNode: ReactNode;
}>;

interface OwnProps {
  isOpen: boolean;
  position: IVector2;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  withPortal?: boolean;
  isDense?: boolean;
  noCompact?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
  animations?: {
    layout?: boolean | "position" | "size" | "preserve-aspect";
  };
}

const ContextMenu: FC<Readonly<OwnProps>> = ({
  isOpen,
  position,
  children,
  className,
  style,
  withPortal,
  isDense,
  noCompact = false,
  triggerRef,
  animations: { layout = undefined } = {},
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

  useKeyboardListeners({ bindings: { onEsc: onClose } });

  const getTriggerElement = useStableCallback(
    () => triggerRef?.current || document.body,
  );

  const getRootElement = useStableCallback(() => containerRef.current);
  const getMenuElement = useStableCallback(() => bubbleRef.current);

  const getLayout = useCallback(
    () => ({
      isDense,
      shouldAvoidNegativePosition: true,
      withPortal: true,
      menuElMinWidth: noCompact ? 220 : 120,
    }),
    [isDense, noCompact],
  );

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
        className={"context-menu-container"}
        style={style}
        {...ANIMATION_PROPS}
        onAnimationEnd={onCloseAnimationEnd}
        layout={layout}
      >
        <div
          className={buildClassName("context-menu-bubble", className)}
          ref={bubbleRef}
          onContextMenu={stopEvent}
          tabIndex={0}
        >
          {children}
        </div>
      </motion.div>
    ),
    [className, style, children, onCloseAnimationEnd],
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (withPortal ? <Portal>{menuEl}</Portal> : menuEl)}
    </AnimatePresence>
  );
};

export default memo(ContextMenu);
export { type OwnProps as ContextMenuProps };
