import {
  FC,
  memo,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Portal from "./Portal";
import trapFocus from "@/lib/utils/trapFocus";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import { useStableCallback } from "@/shared/hooks/base";
import { useEffectWithPreviousDeps } from "../hooks/effects/useEffectWithPreviousDependencies";
import buildClassName from "../lib/buildClassName";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";
import { dispatchHeavyAnimation } from "@/lib/core";
import useBodyClass from "../hooks/DOM/useBodyClass";

import "./Modal.scss";
import { withFreezeWhenClosed } from "@/lib/core";

const ANIMATION_DURATION = 0.125;

// Predefined animation variants to prevent recalculation
const BACKDROP_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const DIALOG_VARIANTS: Variants = {
  initial: { opacity: 0, y: "-10%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "-10%" },
};

const TRANSITION = { duration: ANIMATION_DURATION };

type ModalProps = {
  "aria-label"?: string;
  dialogRef?: RefObject<HTMLDivElement | null>;
  title?: string | ReactNode[];
  className?: string;
  contentClassName?: string;
  isOpen: boolean;
  header?: ReactNode;
  noBackdrop?: boolean;
  noBackdropClose?: boolean;
  backdropBlur?: boolean;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onEnter?: () => void;
};

const Modal: FC<ModalProps> = memo(
  ({
    className,
    contentClassName,
    isOpen,
    noBackdrop = false,
    noBackdropClose = false,
    backdropBlur = false,
    children,
    onClick,
    onClose,
    onEnter,
    dialogRef,
    "aria-label": ariaLabel,
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const id = useUniqueId("modal", ariaLabel);

    // Memoize class names to prevent unnecessary recalculations
    const modalClasses = useMemo(
      () =>
        buildClassName(
          "Modal",
          backdropBlur && "backdropBlur",
          noBackdrop && "nobackdrop",
        ),
      [backdropBlur, noBackdrop],
    );

    const dialogClasses = useMemo(
      () =>
        buildClassName("Dialog", buildClassName(className, contentClassName)),
      [className, contentClassName],
    );

    const handleBackdropClick = useStableCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!noBackdropClose) {
          onClose();
        }
      },
    );

    const handleModalClick = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick?.(e);
      },
      [onClick],
    );

    const handleEnter = useCallback(
      (e: KeyboardEvent) => {
        if (!onEnter) return false;
        e.preventDefault();
        onEnter();
        return true;
      },
      [onEnter],
    );

    useEffect(() => {
      if (!isOpen || !modalRef.current) return;

      const modal = modalRef.current;
      const keyboardCleanup = captureKeyboardListeners({
        bindings: { onEsc: onClose, onEnter: handleEnter },
      });
      const focusCleanup = trapFocus(modal);

      return () => {
        keyboardCleanup();
        focusCleanup();
      };
    }, [isOpen, onClose, handleEnter]);

    useBodyClass("has-open-dialog", isOpen);

    useEffectWithPreviousDeps(
      ([prevIsOpen]) => {
        if (isOpen !== prevIsOpen) {
          return dispatchHeavyAnimation(ANIMATION_DURATION);
        }
      },
      [isOpen],
    );

    return (
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={modalRef}
              id={id}
              variants={BACKDROP_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={TRANSITION}
              className={modalClasses}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-describedby="dialog-description"
              aria-labelledby="dialog-title"
              onClick={handleBackdropClick}
            >
              <motion.div
                ref={dialogRef}
                variants={DIALOG_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={TRANSITION}
                className={dialogClasses}
                onClick={handleModalClick}
              >
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    );
  },
);

Modal.displayName = "Modal";

export default withFreezeWhenClosed(Modal);
export type { ModalProps };
