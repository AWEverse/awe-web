import { useEffect, useState, useRef, RefObject, MutableRefObject } from 'react';

interface SwipeDirection {
  x: number;
  y: number;
}

const useSwipe = <T extends HTMLElement>(
  ref: RefObject<T> | MutableRefObject<T>,
  onSwipeStart?: AnyToVoidFunction,
  onSwipeEnd?: AnyToVoidFunction,
  isDisabled = false,
  continuous = false,
) => {
  const [direction, setDirection] = useState<SwipeDirection | null>(null);
  const xDown = useRef<number | null>(null);
  const yDown = useRef<number | null>(null);

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    const getTouches = (evt: TouchEvent | MouseEvent) => {
      if ('touches' in evt) {
        return evt.touches;
      } else {
        return [{ clientX: evt.clientX, clientY: evt.clientY }];
      }
    };

    const handleStart = (evt: TouchEvent | MouseEvent) => {
      const firstTouch = getTouches(evt)[0];
      xDown.current = firstTouch.clientX;
      yDown.current = firstTouch.clientY;

      if (onSwipeStart) {
        onSwipeStart();
      }
    };

    const handleMove = (evt: TouchEvent | MouseEvent) => {
      if (!xDown.current || !yDown.current) {
        return;
      }

      const { clientX, clientY } = getTouches(evt)[0];

      const xDiff = xDown.current - clientX;
      const yDiff = yDown.current - clientY;

      const newDirection: SwipeDirection = { x: 0, y: 0 };

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        newDirection.x = xDiff > 0 ? -1 : 1; // Left or Right swipe
      } else {
        newDirection.y = yDiff > 0 ? -1 : 1; // Up or Down swipe
      }

      setDirection(newDirection);

      if (!continuous) {
        handleEnd();
      }
    };

    const handleEnd = () => {
      if (onSwipeEnd && continuous) {
        onSwipeEnd();
      }

      xDown.current = null;
      yDown.current = null;
    };

    const element = ref.current;

    if (element) {
      element.addEventListener('touchstart', handleStart, false);
      element.addEventListener('touchmove', handleMove, false);
      element.addEventListener('touchend', handleEnd, false);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleStart, false);
        element.removeEventListener('touchmove', handleMove, false);
        element.removeEventListener('touchend', handleEnd, false);
      }
    };
  }, [isDisabled, onSwipeStart, onSwipeEnd, ref, continuous]);

  return direction;
};

export default useSwipe;
