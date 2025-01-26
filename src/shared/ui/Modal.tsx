import React, {
  CSSProperties,
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
import { useLayoutEffectWithPreviousDeps } from "../hooks/effects/useEffectWithPreviousDependencies";
import buildClassName from "../lib/buildClassName";
import useUniqueId from "@/lib/hooks/utilities/useUniqueId";
import { dispatchHeavyAnimation, withFreezeWhenClosed } from "@/lib/core";

const ANIMATION_DURATION = 0.15;

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
  const UUID = useUniqueId(`modal`, ariaLabel);
  const modalRef = useRef<HTMLDivElement>(null);

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
    if (!onEnter) {
      return false;
    }
    e.preventDefault();
    onEnter();
    return true;
  });

  useEffect(() => {
    const modal = modalRef.current;

    if (isOpen && modal) {
      const keyboardListenersCleanup = captureKeyboardListeners({
        onEsc: onClose,
        onEnter: handleEnter,
      });

      const trapFocusCleanup = trapFocus(modal);

      return () => {
        keyboardListenersCleanup();
        trapFocusCleanup();
      };
    }
  }, [isOpen, onClose, handleEnter]);

  useLayoutEffectWithPreviousDeps(
    ([prevIsOpen]) => {
      document.body.classList.toggle("has-open-dialog", isOpen);

      const isOpened = prevIsOpen && !isOpen;

      if (isOpen || isOpened) {
        dispatchHeavyAnimation(ANIMATION_DURATION);
      }

      return () => {
        document.body.classList.remove("has-open-dialog");
      };
    },
    [isOpen],
  );

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={UUID}
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION_DURATION }}
            id={UUID}
            aria-modal
            aria-describedby="dialog-description"
            aria-label={ariaLabel}
            aria-labelledby="dialog-title"
            className={buildClassName(
              "Modal",
              `fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9998] ${backdropBlur ? "backdrop-blur-lg" : noBackdrop ? "" : "bg-black/50"}`,
            )}
            tabIndex={-1}
            role="dialog"
            onClick={handleClick}
            style={{ willChange: "opacity" }}
          >
            <motion.div
              ref={dialogRef}
              className={`relative p-4 rounded-lg shadow-lg z-[9999] min-w-[17.5rem] max-w-[92dvh] max-h-[92dvh] m-auto ${buildClassName(
                className,
                contentClassName,
              )}`}
              style={{ willChange: "opacity, transform" }}
              onClick={handleModalClick}
              initial={{ opacity: 0, y: "-10%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-10%" }}
              transition={{ duration: ANIMATION_DURATION }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default memo(withFreezeWhenClosed(Modal));
export const ModalUnfreeze = memo(Modal);
export type { OwnProps as ModalProps };
