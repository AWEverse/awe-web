import React, { FC, memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pipe } from "@/lib/core/public/misc/Pipe";
import {
  useDropdownState,
  useDropdownAccessibility,
  useDropdownEffects,
} from "../hooks";
import buildClassName from "@/shared/lib/buildClassName";
import { useRefInstead } from "@/shared/hooks/base";
import s from "./Dropdown.module.scss";
import { dispatchHeavyAnimation } from "@/lib/core";
import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";
import { useEffectWithPreviousDeps } from "@/shared/hooks/effects/useEffectWithPreviousDependencies";

interface OwnTriggerProps<T = HTMLElement> extends React.HTMLAttributes<T> {
  onTrigger: NoneToVoidFunction;
  isOpen?: boolean;
  tabIndex?: number;
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
  usePortal?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onHide?: () => void;
  onEnter?: () => void;
  onTransitionEnd?: () => void;
  onBackdropMouseEnter?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
}

const SCALE_FACTOR = 0.85; //%
const ANIMATION_DURATION = 0.15;

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

  const { isOpen, handleToggle, handleClose } = useDropdownState({
    onOpen,
    onClose,
    shouldClose,
  });

  useDropdownAccessibility({
    onClose: handleClose,
    onEnter,
  });

  useBodyClass("has-open-dialog", isOpen);

  useBoundaryCheck({
    elementRef: dropdownRef,
    isActive: isOpen,
    onExit: handleClose,
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

  const renderBackdrop = useCallback(
    () =>
      isOpen && (
        <div
          className={s.dropdownBackdrop}
          role="presentation"
          onClick={handleClose}
        />
      ),
    [isOpen, handleClose],
  );

  return (
    <div className={buildClassName(s.dropdownContainer, containerClass)}>
      {TriggerButton && (
        <TriggerButton isOpen={isOpen} onTrigger={handleToggle} tabIndex={-1} />
      )}

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ scale: SCALE_FACTOR, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: SCALE_FACTOR, opacity: 0 }}
            transition={{
              duration: ANIMATION_DURATION,
              ease: "easeInOut",
            }}
            role="menu"
            aria-hidden={!isOpen}
            aria-expanded={isOpen}
            data-position={position}
            tabIndex={-1}
            className={buildClassName(s.dropdownMenu)}
            onMouseEnter={onBackdropMouseEnter}
            onTransitionEnd={onTransitionEnd}
          >
            <div className={buildClassName(s.dropdownBody, className)}>
              {children}
            </div>
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
  OwnSharedProps as DropdopwnSharedProps,
};
