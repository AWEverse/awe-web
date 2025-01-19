import Portal from "./Portal";

import "./Menu.scss";
import { dispatchHeavyAnimation, IS_BACKDROP_BLUR_SUPPORTED } from "@/lib/core";
import useEffectWithPrevDeps from "@/lib/hooks/effects/useEffectWithPrevDeps";
import { useStableCallback } from "@/shared/hooks/base";
import useHistoryBack from "@/lib/hooks/history/useHistoryBack";
import useAppLayout from "@/lib/hooks/ui/useAppLayout";
import { FC, useRef, useEffect, memo } from "react";
import useKeyboardListNavigation from "../hooks/keyboard/useKeyboardListNavigation";
import useMenuPosition, {
  MenuPositionOptions,
} from "../hooks/DOM/useMenuPosition";
import useVirtualBackdrop, {
  BACKDROP_CLASSNAME,
} from "../hooks/DOM/useVirtualBackdrop";
import buildClassName from "../lib/buildClassName";
import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";

type OwnProps = {
  ref?: React.RefObject<HTMLDivElement>;
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

const ANIMATION_DURATION = 200;

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

  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useMenuPosition(isOpen, containerRef, bubbleRef, positionOptions);

  useEffect(
    () => (isOpen ? captureKeyboardListeners({ onEsc: onClose }) : undefined),
    [isOpen, onClose],
  );

  useHistoryBack({
    isActive: isOpen,
    onBack: onClose,
    shouldBeReplaced: true,
  });

  useEffectWithPrevDeps(
    ([prevIsOpen]) => {
      if (isOpen || (!isOpen && prevIsOpen === true)) {
        dispatchHeavyAnimation(ANIMATION_DURATION);
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

  const menu = (
    <div
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
    </div>
  );

  if (withPortal) {
    return <Portal>{menu}</Portal>;
  }

  return menu;
};

export default memo(Menu);
