import {
  FC,
  memo,
  MouseEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const ANIMATION_DURATION = 0.15;

type NoneToVoidFunction = () => void;

type OwnProps = {
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
  onClose: NoneToVoidFunction;
  onEnter?: NoneToVoidFunction;
};

/**
 * Custom hook to encapsulate the shared Framer Motion animation properties.
 */
function useModalAnimation(duration: number = ANIMATION_DURATION) {
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const dialogVariants = {
    initial: { opacity: 0, y: "-10%" },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: "-10%" },
  };

  const transition = { duration };

  return { backdropVariants, dialogVariants, transition };
}

/**
 * Modal component with customizable properties for handling display, interaction, and animations.
 */
const Modal: FC<OwnProps> = ({
  className,
  contentClassName,
  isOpen,
  noBackdrop,
  noBackdropClose = false,
  backdropBlur,
  children,
  onClick,
  onClose,
  onEnter,
  dialogRef,
  "aria-label": ariaLabel,
}) => {
  const UUID = useUniqueId("modal", ariaLabel);
  const modalRef = useRef<HTMLDivElement>(null);
  const { backdropVariants, dialogVariants, transition } = useModalAnimation();

  const handleClick = useStableCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!noBackdropClose) {
      onClose();
    }
  });

  const handleModalClick = useStableCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick?.(e);
    },
  );

  const handleEnter = useStableCallback((e: KeyboardEvent) => {
    if (!onEnter) return false;
    e.preventDefault();
    onEnter();
    return true;
  });

  useEffect(() => {
    const modal = modalRef.current;
    if (isOpen && modal) {
      const keyboardListenersCleanup = captureKeyboardListeners({
        bindings: { onEsc: onClose, onEnter: handleEnter },
      });

      const trapFocusCleanup = trapFocus(modal);

      return () => {
        keyboardListenersCleanup();
        trapFocusCleanup();
      };
    }
  }, [isOpen, onClose, handleEnter]);

  useBodyClass("has-open-dialog", isOpen);

  useEffectWithPreviousDeps(
    ([wasOpen]) => {
      if (isOpen !== wasOpen) {
        return dispatchHeavyAnimation(ANIMATION_DURATION);
      }
    },
    [isOpen],
  );

  const modalClasses = buildClassName(
    "Modal",
    backdropBlur && "backdropBlur",
    noBackdrop && "nobackdrop",
  );

  const dialogClasses = buildClassName(
    "Dialog",
    buildClassName(className, contentClassName),
  );
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={UUID}
            key={UUID}
            ref={modalRef}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            aria-modal
            aria-describedby="dialog-description"
            aria-label={ariaLabel}
            aria-labelledby="dialog-title"
            className={modalClasses}
            tabIndex={-1}
            role="dialog"
            onClick={handleClick}
          >
            <motion.div
              ref={dialogRef}
              variants={dialogVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
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
};

export default memo(Modal);
export type { OwnProps as ModalProps };
