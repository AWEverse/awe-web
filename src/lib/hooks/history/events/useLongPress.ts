import {
  useComponentDidMount,
  useComponentWillUnmount,
} from "@/shared/hooks/effects/useLifecycle";
import { useRef, useCallback, useEffect, type SyntheticEvent } from "react";

interface LongPressOptions {
  delay?: number;
  shouldPreventDefault?: boolean;
  repeatInterval?: number;
  onStart?: (event: SyntheticEvent) => void;
  onFinish?: (event: SyntheticEvent) => void;
  onCancel?: (event: SyntheticEvent) => void;
}

const useLongPress = (
  callback: (event: SyntheticEvent) => void,
  options: LongPressOptions = {},
) => {
  const {
    delay = 300,
    shouldPreventDefault = true,
    repeatInterval,
    onStart,
    onFinish,
    onCancel,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const targetRef = useRef<EventTarget>(null);

  const start = useCallback(
    (event: SyntheticEvent) => {
      if (shouldPreventDefault && event.cancelable) {
        event.preventDefault();
      }

      if (onStart) onStart(event);

      targetRef.current = event.target;

      timeoutRef.current = setTimeout(() => {
        callback(event);

        if (repeatInterval) {
          intervalRef.current = setInterval(() => {
            callback(event);
          }, repeatInterval);
        }
      }, delay);
    },
    [callback, delay, repeatInterval, shouldPreventDefault, onStart],
  );

  const clear = useCallback(
    (event: SyntheticEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (intervalRef.current && onFinish) {
        onFinish?.(event);
      } else if (timeoutRef.current && onCancel) {
        onCancel(event);
      }

      timeoutRef.current = null;
      intervalRef.current = null;
    },
    [onCancel, onFinish],
  );

  // Prevent context menu on long press
  useComponentDidMount(() => {
    if (!targetRef.current) {
      return undefined;
    }

    const listener = (event: Event) => {
      if (targetRef.current) {
        event.preventDefault();
      }
    };

    targetRef.current.addEventListener("contextmenu", listener);

    return () => {
      targetRef.current?.removeEventListener("contextmenu", listener);
    };
  });

  // Cleanup timers on unmount
  useComponentWillUnmount(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  });

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
};

export default useLongPress;
