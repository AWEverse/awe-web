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
import useLayoutEffectWithPrevDeps from '@/lib/hooks/effects/useLayoutEffectWithPrevDeps';
import buildClassName from '../lib/buildClassName';
import useUniqueId from '@/lib/hooks/utilities/useUniqueId';
import { dispatchHeavyAnimation, withFreezeWhenClosed } from '@/lib/core';
import useHistoryBack from '@/lib/hooks/history/useHistoryBack';

const ANIMATION_DURATION = 300;

type OwnProps = {
  'aria-label'?: string;
  dialogRef?: RefObject<HTMLDivElement | null>;
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

  onClick?: EventToVoidFunction<MouseEvent<HTMLDivElement>>;
  onClose: NoneToVoidFunction;
  onCloseAnimationEnd?: NoneToVoidFunction;
  onEnter?: NoneToVoidFunction;
};

/**
 * Modal component with customizable properties for handling display, interaction, and animations.
 *
 * Props:
 *
 * | **Property**               | **Example**                                          | **Type**                            | **Status**        |
 * |----------------------------|-----------------------------------------------------|-------------------------------------|-------------------|
 * | `aria-label`                | `aria-label="Modal window"`                         | String                              | Optional          |
 * | `dialogRef`                 | `dialogRef={modalRef}`                              | `RefObject<HTMLDivElement \| null>`         | Optional          |
 * | `title`                     | `title="Modal Title"`                               | String \| ReactNode[]                  | Optional          |
 * | `className`                 | `className="modal-custom"`                          | String                              | Optional          |
 * | `contentClassName`          | `contentClassName="modal-content"`                  | String                              | Optional          |
 * | `isOpen`                    | `isOpen={true}`                                     | Boolean                             | Required          |
 * | `header`                    | `header={<h2>Header Content</h2>}`                  | ReactNode                           | Optional          |
 * | `isSlim`                    | `isSlim={true}`                                     | Boolean                             | Optional          |
 * | `noBackdrop`                | `noBackdrop={true}`                                 | Boolean                             | Optional          |
 * | `noBackdropClose`           | `noBackdropClose={true}`                            | Boolean                             | Optional          |
 * | `backdropBlur`              | `backdropBlur={true}`                               | Boolean                             | Optional          |
 * | `children`                  | `children={<p>Modal body content</p>}`              | ReactNode                           | Optional          |
 * | `style`                     | `style={{ width: '500px', height: '400px' }}`       | CSSProperties                       | Optional          |
 * | `onClick`                   | `onClick={e => handleClick(e)}`                     | Function                            | Optional          |
 * | `onClose`                   | `onClose={handleClose}`                             | Function                            | Required          |
 * | `onCloseAnimationEnd`       | `onCloseAnimationEnd={handleAnimationEnd}`          | Function                            | Optional          |
 * | `onEnter`                   | `onEnter={handleEnter}`                             | Function                            | Optional          |
 */
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
    if (!onEnter) {
      return false;
    }

    e.preventDefault();
    onEnter();
    return true;
  });

  useHistoryBack({
    isActive: isOpen,
    onBack: onClose,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, handleEnter]);

  useLayoutEffectWithPrevDeps(
    ([prevIsOpen]) => {
      document.body.classList.toggle('has-open-dialog', isOpen);

      const isOpened = !isOpen && prevIsOpen !== undefined;

      if (isOpen || isOpened) {
        dispatchHeavyAnimation(ANIMATION_DURATION);
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
          id={UUID}
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
          tabIndex={-1}
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
