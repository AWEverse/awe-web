import React, { FC, useState, memo, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import s from './DropdownMenu.module.scss';
import buildClassName from '../lib/buildClassName';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import captureKeyboardListeners from '@/lib/utils/captureKeyboardListeners';
import LightEffect from './common/LightEffect';
import trapFocus from '@/lib/utils/trapFocus';
import useLayoutEffectWithPrevDeps from '@/lib/hooks/effects/useLayoutEffectWithPrevDeps';
import { dispatchHeavyAnimation, throttle, withFreezeWhenClosed } from '@/lib/core';
import { pipe } from '@/lib/core/public/misc/Pipe';

interface OwnTriggerProps<T = HTMLElement> extends React.HTMLAttributes<T> {
  onTrigger: NoneToVoidFunction;
  isOpen?: boolean;
  tabIndex?: number;
}

interface OwnSharedProps {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface OwnProps {
  reference?: React.RefObject<HTMLDivElement>;
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
  onBackdropMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const OUTBOX_SIZE = 60; //px
const SCALE_FACTOR = 0.85; //%
const THROTTLE_INTERVAL = 250; //1/4 of a second
const TRANSITION_DURATION = 250;

const DropdownMenu: FC<OwnProps & OwnSharedProps> = ({
  reference,
  className,
  containerClass,
  children,
  triggerButton: TriggerButton,
  position = 'top-right',
  shouldClose,
  onOpen,
  onClose,
  onHide,
  onEnter,
  onTransitionEnd,
  onBackdropMouseEnter,
}) => {
  const dropdownRef = useRefInstead<HTMLDivElement>(reference);

  const [isOpen, setIsOpen] = useState(false);

  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');

  const handleTriggerClick = () => {
    setIsOpen(prev => !prev);

    isOpen ? onOpen?.() : onClose?.();
  };

  const handleClose = useLastCallback(() => {
    setIsOpen(false);
    onClose?.();
  });

  const handleEnter = useLastCallback((e: KeyboardEvent) => {
    e.preventDefault();

    return onEnter ? (onEnter?.(), true) : false;
  });

  useEffect(() => {
    if (shouldClose) {
      handleClose();
      return;
    }

    if (isOpen) {
      const releaseListeners = captureKeyboardListeners({
        onEsc: handleClose,
        onEnter: handleEnter,
      });

      return () => {
        releaseListeners();
      };
    }
  }, [shouldClose, isOpen, handleEnter, handleClose]);

  useEffect(() => {
    const menu = dropdownRef.current;

    if (!menu || !isOpen) return;

    const position = menu!.getBoundingClientRect();

    const handleMove = throttle((e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      // TODO: Fix on diff aligments
      // Check if pointer is inside the expanded area
      // Scale factor is a for a forward compatibility
      // adj = adjusted

      const factoredPosition = {
        top: position.top / (isTop ? SCALE_FACTOR : 1),
        left: position.left / (isLeft ? SCALE_FACTOR : 1),
        right: position.right / (isLeft ? SCALE_FACTOR : 1),
        bottom: position.bottom / (isTop ? SCALE_FACTOR : 1),
      };

      const adjTop = factoredPosition.top - OUTBOX_SIZE;
      const adjLeft = factoredPosition.left - OUTBOX_SIZE;
      const adjRight = factoredPosition.right + OUTBOX_SIZE;
      const adjBottom = factoredPosition.bottom + OUTBOX_SIZE;

      const isPointerInside = x > adjLeft && x < adjRight && y > adjTop && y < adjBottom;

      if (!isPointerInside) {
        handleClose();
      }
    }, THROTTLE_INTERVAL);

    const trapFocusCleanup = trapFocus(menu);
    window.addEventListener('mousemove', handleMove);

    return () => {
      trapFocusCleanup();
      window.removeEventListener('mousemove', handleMove);
    };
  }, [isOpen, handleClose]);

  useLayoutEffectWithPrevDeps(
    ([prevIsOpen]) => {
      document.body.classList.toggle('has-open-dialog', isOpen);

      const isOpened = !isOpen && prevIsOpen !== undefined;

      if (isOpen || isOpened) {
        dispatchHeavyAnimation(TRANSITION_DURATION);
      }

      return () => {
        document.body.classList.remove('has-open-dialog');
      };
    },
    [isOpen],
  );

  return (
    <div className={buildClassName(s.dropdownContainer, containerClass)}>
      {TriggerButton && (
        <TriggerButton isOpen={isOpen} onTrigger={handleTriggerClick} tabIndex={-1} />
      )}

      <CSSTransition
        unmountOnExit
        classNames="scale-transition"
        in={isOpen}
        nodeRef={dropdownRef}
        timeout={TRANSITION_DURATION}
        onExited={onHide}
        onTransitionEnd={onTransitionEnd}
      >
        <div
          ref={dropdownRef}
          role="menu"
          aria-hidden={!isOpen}
          aria-expanded={isOpen}
          data-position={position}
          tabIndex={-1}
          className={buildClassName(s.dropdownMenu, s[position])}
          onMouseEnter={onBackdropMouseEnter}
        >
          <section className={buildClassName(s.dropdownBody, className)}>{children}</section>
          <LightEffect gridRef={dropdownRef} lightSize={700} />
        </div>
      </CSSTransition>

      {isOpen && <div className={s.dropdownBackdrop} role="presentation" onClick={handleClose} />}
    </div>
  );
};

export default pipe(withFreezeWhenClosed, memo)(DropdownMenu);
export type { OwnTriggerProps as TriggerProps, OwnSharedProps as DropdopwnSharedProps };
