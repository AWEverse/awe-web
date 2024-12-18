import {
  CSSProperties,
  FC,
  memo,
  MouseEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import s from './Modal.module.scss';
import Portal from './Portal';
import trapFocus from '@/lib/utils/trapFocus';
import captureKeyboardListeners from '@/lib/utils/captureKeyboardListeners';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import { dispatchHeavyAnimationEvent } from '@/lib/hooks/sensors/useHeavyAnimationCheck';
import useLayoutEffectWithPrevDeps from '@/lib/hooks/effects/useLayoutEffectWithPrevDeps';
import buildClassName from '../lib/buildClassName';
import { registerModal, unregisterModal } from '../lib/composers/ModalManager';
import useUniqueId from '@/lib/hooks/utilities/useUniqueId';
import { requestMutation } from '@/lib/modules/fastdom/fastdom';
import { withFreezeWhenClosed } from '@/lib/core';

const ANIMATION_DURATION = 300;

type OwnProps = {
  'aria-label'?: string;
  dialogRef?: RefObject<HTMLDivElement>;
  title?: string | ReactNode[];
  className?: string;
  contentClassName?: string;
  isOpen: boolean;
  header?: ReactNode;
  isSlim?: boolean;
  noBackdrop?: boolean;
  noBackdropClose?: boolean;
  backdropBlur?: boolean;
  children?: ReactNode;
  style?: CSSProperties;

  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
  onEnter?: () => void;
};

const Modal: FC<OwnProps> = ({
  className,
  contentClassName,
  isOpen,
  isSlim,
  noBackdrop,
  noBackdropClose = false,
  backdropBlur,
  children,
  style,
  onClick,
  onClose,
  onCloseAnimationEnd,
  onEnter,
  dialogRef,
  'aria-label': ariaLabel,
}) => {
  const UUID = useUniqueId(`modal`, ariaLabel);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleClick = useLastCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!noBackdropClose) {
      onClose();
    }
  });

  const handleModalClick = useLastCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    onClick?.(e);
  });

  const handleEnter = useLastCallback((e: KeyboardEvent) => {
    e.preventDefault();

    return onEnter ? (onEnter?.(), true) : false;
  });

  useEffect(() => {
    const modal = modalRef.current;

    if (isOpen && modal) {
      const keyboardListenersCleanup = captureKeyboardListeners({
        onEsc: onClose,
        onEnter: handleEnter,
      });

      const trapFocusCleanup = trapFocus(modal);

      const modalRefObject = {
        onClose,
        setIsVisible: (visible: boolean) => {
          requestMutation(() => {
            modal.style.visibility = visible ? 'visible' : 'hidden';
          });
        },
      };

      registerModal(UUID, modalRefObject);

      return () => {
        keyboardListenersCleanup();
        trapFocusCleanup();
        unregisterModal(UUID);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, handleEnter]);

  useLayoutEffectWithPrevDeps(
    ([prevIsOpen]) => {
      document.body.classList.toggle('has-open-dialog', Boolean(isOpen));

      const isOpened = !isOpen && prevIsOpen !== undefined;

      if (isOpen || isOpened) {
        dispatchHeavyAnimationEvent(ANIMATION_DURATION);
      }

      return () => {
        document.body.classList.remove('has-open-dialog');
      };
    },
    [isOpen],
  );

  const classNames = buildClassName(
    s.modalContent,
    className,
    isSlim && s.modalSlim,
    contentClassName,
  );

  return (
    <Portal>
      <CSSTransition
        unmountOnExit
        classNames={{
          enter: s.modalEnter,
          enterActive: s.modalEnterActive,
          exit: s.modalExit,
          exitActive: s.modalExitActive,
        }}
        in={isOpen}
        nodeRef={modalRef}
        timeout={ANIMATION_DURATION}
        onEntered={onEnter}
        onExited={onCloseAnimationEnd}
      >
        <div
          ref={modalRef}
          aria-modal
          aria-describedby="dialog-description"
          aria-label={ariaLabel}
          aria-labelledby="dialog-title"
          className={buildClassName(
            'Modal',
            s.modalBackdrop,
            backdropBlur ? s.backdropBlur : noBackdrop && s.noBackdrop,
          )}
          role="dialog"
          onClick={handleClick}
        >
          <div ref={dialogRef} className={classNames} style={style} onClick={handleModalClick}>
            {children}
          </div>
        </div>
      </CSSTransition>
    </Portal>
  );
};

export default memo(withFreezeWhenClosed(Modal));
export const ModalUnfreeze = memo(Modal);
export type { OwnProps as ModalProps };
