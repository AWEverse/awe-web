import buildClassName from '@/shared/lib/buildClassName';
import { FC, useRef, useState, useCallback, useEffect, memo, CSSProperties } from 'react';

import buildStyle from '@/shared/lib/buildStyle';
import stopEvent from '@/lib/utils/stopEvent';

import styles from './index.module.scss';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

type TPoint = {
  x: number;
  y: number;
};

type DraggableState = {
  isDragging: boolean;
  origin: TPoint;
  translation: TPoint;
  width?: number;
  height?: number;
};

type OwnProps = {
  children: React.ReactNode;
  onDrag: (translation: TPoint, id: number | string) => void;
  onDragEnd: NoneToVoidFunction;
  id: number | string;
  style?: string;
  knobStyle?: CSSProperties;
  isDisabled?: boolean;
  className?: string;
  horizontal?: boolean;
  vertical?: boolean;
};

type EventWithClientCoordinates = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;

function getClientCoordinate(e: EventWithClientCoordinates, horizontal: boolean = false, vertical: boolean = false) {
  const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;

  return { x: horizontal ? clientX : 0, y: vertical ? clientY : 0 };
}

const ZERO_POINT: TPoint = { x: 0, y: 0 };

const Draggable: FC<OwnProps> = memo(
  ({
    children,
    id,
    onDrag,
    onDragEnd,
    style: externalStyle,
    knobStyle,
    className,
    isDisabled,
    horizontal = false,
    vertical = false,
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<DraggableState>({
      isDragging: false,
      origin: ZERO_POINT,
      translation: ZERO_POINT,
    });

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      stopEvent(e);

      const { x, y } = getClientCoordinate(e, horizontal, vertical);

      requestMeasure(() => {
        setState({
          ...state,
          isDragging: true,
          origin: { x, y },
          width: ref.current?.offsetWidth,
          height: ref.current?.offsetHeight,
        });
      });
    };

    const handleMouseMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        const { x, y } = getClientCoordinate(e, horizontal, vertical);

        const translation = {
          x: x - state.origin.x,
          y: y - state.origin.y,
        };

        setState(current => ({
          ...current,
          translation,
        }));

        onDrag(translation, id);
      },
      [id, onDrag, state.origin.x, state.origin.y, horizontal, vertical],
    );

    const handleMouseUp = useCallback(() => {
      setState(current => ({
        ...current,
        isDragging: false,
        width: undefined,
        height: undefined,
      }));

      onDragEnd();
    }, [onDragEnd]);

    useEffect(() => {
      if (state.isDragging && isDisabled) {
        setState(current => ({
          ...current,
          isDragging: false,
          width: undefined,
          height: undefined,
        }));
      }
    }, [isDisabled, state.isDragging]);

    useEffect(() => {
      if (state.isDragging) {
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
        window.addEventListener('touchcancel', handleMouseUp);
        window.addEventListener('mouseup', handleMouseUp);
      } else {
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
        window.removeEventListener('touchcancel', handleMouseUp);
        window.removeEventListener('mouseup', handleMouseUp);

        setState(current => ({
          ...current,
          translation: ZERO_POINT,
        }));
      }

      return () => {
        if (state.isDragging) {
          window.removeEventListener('touchmove', handleMouseMove);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('touchend', handleMouseUp);
          window.removeEventListener('touchcancel', handleMouseUp);
          window.removeEventListener('mouseup', handleMouseUp);
        }
      };
    }, [handleMouseMove, handleMouseUp, state.isDragging]);

    const fullClassName = buildClassName(styles.container, state.isDragging && styles.isDragging, className);

    const cssStyles = buildStyle(
      state.isDragging && `transform: translate(${state.translation.x}px, ${state.translation.y}px)`,
      state.width ? `width: ${state.width}px` : undefined,
      state.height ? `height: ${state.height}px` : undefined,
      externalStyle,
    );

    return (
      <div ref={ref} className={fullClassName} style={cssStyles}>
        {children}

        {!isDisabled && (
          <div
            aria-label={'i18n_dragToSort'}
            className={buildClassName(styles.knob, 'div-button', 'draggable-knob')}
            role="button"
            style={knobStyle}
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <i aria-hidden className="icon icon-sort" />
          </div>
        )}
      </div>
    );
  },
);

export default Draggable;
