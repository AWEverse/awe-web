import { useRef, useCallback } from 'react';
import useEffectOnce from '../effects/useEffectOnce';

const DEFAULT_THRESHOLD = 500;

interface LongPressProps {
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void;
  onStart?: NoneToVoidFunction;
  onEnd?: NoneToVoidFunction;
  threshold?: number;
}

function useLongPress({ onClick, onStart, onEnd, threshold = DEFAULT_THRESHOLD }: LongPressProps) {
  const isLongPressActive = useRef(false);
  const isPressed = useRef(false);
  const timerId = useRef<number | undefined>(undefined);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canProcessEvent =
        ('button' in e && e.button === 0) || ('touches' in e && e.touches.length > 0);

      if (isPressed.current || !canProcessEvent) {
        return;
      }

      isPressed.current = true;
      timerId.current = window.setTimeout(() => {
        onStart?.();
        isLongPressActive.current = true;
      }, threshold);
    },
    [onStart, threshold],
  );

  const cancel = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isPressed.current) return;

      if (isLongPressActive.current) {
        onEnd?.();
      } else {
        onClick?.(e);
      }

      isLongPressActive.current = false;
      isPressed.current = false;
      window.clearTimeout(timerId.current);
    },
    [onEnd, onClick],
  );

  useEffectOnce(() => () => {
    window.clearTimeout(timerId.current);
  });

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
}

export default useLongPress;
