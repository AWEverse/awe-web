import React, { FC, memo, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDropdownState } from "../hooks";
import buildClassName from "@/shared/lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import s from "./Dropdown.module.scss";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";
import { useEffectWithPreviousDeps } from "@/shared/hooks/effects/useEffectWithPreviousDependencies";
import useKeyboardListeners from "@/lib/hooks/events/useKeyboardListeners";
import trapFocus from "@/lib/utils/trapFocus";
import { useClickAway } from "@/lib/hooks/events/useClick";

interface OwnTriggerProps<T = HTMLElement> extends React.HTMLAttributes<T> {
  onTrigger: () => void;
  isOpen?: boolean;
}

interface OwnSharedProps {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

interface OwnProps {
  ref?: React.RefObject<HTMLDivElement>;
  className?: string;
  containerClass?: string;
  children: React.ReactNode;
  triggerButton?: FC<OwnTriggerProps>;
  isOpen?: boolean;
  shouldClose?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onHide?: () => void;
  onEnter?: () => void;
  onTransitionEnd?: () => void;
  onBackdropMouseEnter?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
}

const SCALE_FACTOR = 0.85;
const ANIMATION_DURATION = 0.125;

const DropdownMenu: FC<OwnProps & OwnSharedProps> = ({
  ref,
  className,
  containerClass,
  children,
  triggerButton: TriggerButton,
  position = "top-right",
  shouldClose,
  onOpen,
  onClose,
  onEnter,
  onTransitionEnd,
  onBackdropMouseEnter,
}) => {
  const dropdownRef = useRefInstead<HTMLDivElement>(ref);
  const shouldReduceMotion = useReducedMotion();

  const { isOpen, handleToggle, handleClose } = useDropdownState({
    onOpen,
    onClose,
    shouldClose,
  });

  const dropdownVariants = useMemo(
    () =>
      shouldReduceMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { transform: `scale(${SCALE_FACTOR})`, opacity: 0 },
            animate: { transform: "scale(1)", opacity: 1 },
            exit: { transform: `scale(${SCALE_FACTOR})`, opacity: 0 },
          },
    [shouldReduceMotion],
  );

  useKeyboardListeners({
    bindings: { onEsc: onClose, onEnter },
    rules: { preventDefault: true },
  });

  useBodyClass("has-open-dialog", isOpen);

  useClickAway(dropdownRef, handleClose);

  useBoundaryCheck({
    elementRef: dropdownRef,
    isActive: isOpen,
    onExit: handleClose,
    options: { outboxSize: 60, throttleInterval: 250 },
  });

  useEffect(() => {
    if (isOpen && dropdownRef.current) return trapFocus(dropdownRef.current);
  }, [isOpen]);

  const renderBackdrop = useCallback(
    () =>
      isOpen && (
        <div
          className={s.dropdownBackdrop}
          role="presentation"
          onClick={handleClose}
          aria-hidden="true"
        />
      ),
    [isOpen, handleClose],
  );

  return (
    <div className={buildClassName(s.dropdownContainer, containerClass)}>
      {TriggerButton && (
        <TriggerButton isOpen={isOpen} onTrigger={handleToggle} tabIndex={-1} />
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: ANIMATION_DURATION, ease: "easeInOut" }}
            role="menu"
            aria-hidden={!isOpen}
            aria-expanded={isOpen}
            data-position={position}
            tabIndex={-1}
            className={buildClassName(s.dropdownMenu, className)}
            onMouseEnter={onBackdropMouseEnter}
            onAnimationComplete={onTransitionEnd}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {renderBackdrop()}
    </div>
  );
};

export default memo(DropdownMenu);
export type {
  OwnTriggerProps as TriggerProps,
  OwnSharedProps as DropdownSharedProps,
};
