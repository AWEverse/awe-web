import { AnimatePresence, motion } from "framer-motion";
import Portal from "./Portal";

import "./Menu.scss";
import { dispatchHeavyAnimation, IS_BACKDROP_BLUR_SUPPORTED } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import { FC, useRef, useEffect, memo } from "react";
import useKeyboardListNavigation from "../hooks/keyboard/useKeyboardListNavigation";
import useMenuPosition, {
  MenuPositionOptions,
} from "../../entities/context-menu/public/hooks/useMenuPosition";
import useVirtualBackdrop, {
  BACKDROP_CLASSNAME,
} from "../hooks/DOM/useVirtualBackdrop";
import buildClassName from "../lib/buildClassName";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import { useEffectWithPreviousDeps } from "../hooks/effects/useEffectWithPreviousDependencies";

type OwnProps = {
  ref?: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  shouldCloseFast?: boolean;
  id?: string;
  className?: string;
  bubbleClassName?: string;
  ariaLabelledBy?: string;
  autoClose?: boolean;
  footer?: string;
  noCloseOnBackdrop?: boolean;
  backdropExcludedSelector?: string;
  noCompact?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onCloseAnimationEnd?: () => void;
  onClose: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseEnterBackdrop?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  withPortal?: boolean;
  children?: React.ReactNode;
} & MenuPositionOptions;

const ANIMATION_DURATION = 0.2; // Adjust as needed

const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const Menu: FC<OwnProps> = ({
  ref: externalRef,
  shouldCloseFast,
  isOpen,
  id,
  className,
  bubbleClassName,
  ariaLabelledBy,
  children,
  autoClose = false,
  footer,
  noCloseOnBackdrop = false,
  backdropExcludedSelector,
  noCompact,
  onCloseAnimationEnd,
  onClose,
  onMouseEnter,
  onMouseLeave,
  withPortal,
  onMouseEnterBackdrop,
  ...positionOptions
}) => {
  const { isTouchScreen } = useAppLayout();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useMenuPosition(isOpen, containerRef, bubbleRef, positionOptions);

  useEffect(
    () =>
      isOpen
        ? captureKeyboardListeners({
            bindings: { onEsc: onClose },
          })
        : undefined,
    [isOpen, onClose],
  );

  useEffectWithPreviousDeps(
    ([prevIsOpen]) => {
      if (isOpen || (!isOpen && prevIsOpen === true)) {
        dispatchHeavyAnimation(ANIMATION_DURATION * 1000); // Animation duration in milliseconds
      }
    },
    [isOpen],
  );

  const handleKeyDown = useKeyboardListNavigation(
    bubbleRef,
    isOpen,
    autoClose ? onClose : undefined,
    undefined,
    true,
  );

  useVirtualBackdrop(
    isOpen,
    containerRef,
    noCloseOnBackdrop ? undefined : onClose,
    undefined,
    backdropExcludedSelector,
  );

  const bubbleFullClassName = buildClassName(
    "bubble menu-container custom-scroll",
    footer && "with-footer",
    bubbleClassName,
    shouldCloseFast && "close-fast",
  );

  const handleClick = useStableCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (autoClose) {
        onClose();
      }
    },
  );

  const menuContent = (
    <motion.div
      ref={containerRef}
      id={id}
      className={buildClassName(
        "Menu",
        !noCompact && !isTouchScreen && "compact",
        !IS_BACKDROP_BLUR_SUPPORTED && "no-blur",
        withPortal && "in-portal",
        className,
      )}
      aria-labelledby={ariaLabelledBy}
      role={ariaLabelledBy ? "menu" : undefined}
      onKeyDown={isOpen ? handleKeyDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={isOpen ? onMouseLeave : undefined}
      variants={dropdownVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: ANIMATION_DURATION,
        ease: "easeInOut",
      }}
    >
      {isOpen && (
        <div
          className={BACKDROP_CLASSNAME}
          onMouseEnter={onMouseEnterBackdrop}
        />
      )}
      <div
        role="presentation"
        ref={bubbleRef}
        className={bubbleFullClassName}
        onClick={handleClick}
      >
        {children}
        {footer && <div className="footer">{footer}</div>}
      </div>
    </motion.div>
  );

  if (withPortal) {
    return (
      <AnimatePresence>
        {isOpen && <Portal>{menuContent}</Portal>}
      </AnimatePresence>
    );
  }

  return <AnimatePresence>{isOpen && menuContent}</AnimatePresence>;
};

export default memo(Menu);
