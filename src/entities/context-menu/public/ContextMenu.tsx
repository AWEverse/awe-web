import useLastCallback from '@/lib/hooks/events/useLastCallback';
import useRefInstead from '@/lib/hooks/state/useRefInstead';
import { IVector2D } from '@/lib/utils/data-structures/Vector2d';
import { throttle } from '@/lib/utils/schedulers';
import stopEvent from '@/lib/utils/stopEvent';
import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';
import { CSSProperties, FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import useContextMenu from './hooks/useContextMenu';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';
import { calculateContextMenuPosition } from '../private/utils';

const TRANSITION_DURATION = 300;

interface OwnProps {
  // Reference to the root element of the context menu which is used to position the context menu
  // or called if portal active as well
  rootRef?: React.RefObject<HTMLDivElement>;
  // Reference to the container of the context menu
  containerRef?: React.RefObject<HTMLDivElement>;

  isOpen: boolean;
  // Positioning and offsets
  // Parent property that is applied to the context menu from the window similar to padding and immediately relative to the isWindowRoot
  rootOffset?: number;
  // This property will make part of the menu hidden if that part of the menu
  // is not the root of the window. Quite similar to "overflow: hidden"
  isWindowRoot?: boolean;
  // Positioning flags depending on the position of the context menu from the dot on the screen
  // that where the context menu was opened
  position: { x: number; y: number };

  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onCloseAnimationEnd?: () => void;

  // Mouse events
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseEnterBackdrop?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

  // Miscellaneous
  id?: string;
  className?: string;
  bubbleClassName?: string;
  style?: CSSProperties;
  bubbleStyle?: string;

  // Behavior flags
  autoClose?: boolean;
  shouldCloseFast?: boolean;
  shouldSkipTransition?: boolean;
  noCloseOnLeave?: boolean;
  noCloseOnBackdrop?: boolean;
  noCompact?: boolean;
  withPortal?: boolean;

  // ARIA
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  // Children
  children?: ReactNode;
}

const initialPosition = {
  x: 0,
  y: 0,
};

const MENU_POSITION_VISUAL_COMFORT_SPACE_PX = 16;
const MENU_POSITION_BOTTOM_MARGIN = 12;

const ContextMenuComponent: FC<OwnProps> = ({
  rootRef,
  containerRef: innerContainerRef,
  isOpen,
  rootOffset,
  isWindowRoot,
  position,
  onClose,
  onKeyDown,
  onCloseAnimationEnd,
  onMouseEnter,
  onMouseLeave,
  onMouseEnterBackdrop,
  id,
  className,
  bubbleClassName,
  style,
  bubbleStyle,
  autoClose,
  shouldCloseFast = false,
  shouldSkipTransition = false,
  noCloseOnLeave,
  noCloseOnBackdrop,
  noCompact,
  withPortal,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
}) => {
  const cntxRef = useRef<HTMLDivElement>(null);
  const [transformOrigin, setTransformOrigin] = useState<{ x: string; y: string }>({
    x: 'left',
    y: 'top',
  });

  const handleOutsideClick = useLastCallback((e: MouseEvent) => {
    if (cntxRef.current && !cntxRef.current.contains(e.target as Node)) {
      onClose();
    }
  });

  const handleKeyDown = useLastCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  });

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleOutsideClick, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      requestMeasure(() => {
        const { transformOrigin: newTransformOrigin } = calculateContextMenuPosition(
          position,
          cntxRef,
        );
        setTransformOrigin(newTransformOrigin);
      });
    }
  }, [isOpen, position]);

  const styles = buildStyle(
    `--transform-origin-x: ${transformOrigin.x}`,
    `--transform-origin-y: ${transformOrigin.y}`,
    `position: absolute`,
    `top: ${position.y}px`,
    `left: ${position.x}px`,
    `border: 1px solid red`,
  );

  const onMouseMove = useLastCallback(
    throttle((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const menu = cntxRef.current;

      console.log('cntxRef.current', menu);

      if (!menu) return;

      const { clientX: x, clientY: y } = e;
      const { top, bottom, left, right } = menu.getBoundingClientRect();
      const borderSize = 60;

      const isPointerInside =
        x >= left - borderSize &&
        x <= right + borderSize &&
        y >= top - borderSize &&
        y <= bottom + borderSize;

      if (!isPointerInside) {
        onClose();
      }
    }, 250),
  );

  return (
    <>
      <CSSTransition
        unmountOnExit
        classNames="context-menu"
        in={isOpen}
        nodeRef={cntxRef}
        timeout={300}
      >
        <div ref={cntxRef} className="ContextMenu" style={styles}>
          {children}
        </div>
      </CSSTransition>
      {isOpen && (
        <div
          className={'ContextBackdrop'}
          onClick={onMouseEnterBackdrop}
          onMouseMove={onMouseMove}
        />
      )}
    </>
  );
};

export default ContextMenuComponent;
