import { useState, useRef } from 'react';
import useLastCallback from '@/lib/hooks/events/useLastCallback';

const BUTTON_CLOSE_DELAY_MS = 250;

export default function useFloatingButton(isTouchEnv: boolean, initialState = false) {
  const isMouseInsideRef = useRef(false);
  const closeTimeoutRef = useRef<number | undefined>(undefined);

  const [isButtonVisible, setIsButtonVisible] = useState(isTouchEnv ? initialState : false);

  const setIsMouseInside = (value: boolean) => {
    isMouseInsideRef.current = value;
  };

  const _handleMouseEnter = useLastCallback(() => {
    if (isTouchEnv) return;
    setIsMouseInside(true);
    setIsButtonVisible(true);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  });

  const _handleMouseLeave = useLastCallback(() => {
    if (isTouchEnv) {
      return;
    }

    setIsMouseInside(false);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isMouseInsideRef.current) {
        setIsButtonVisible(false);
      }
    }, BUTTON_CLOSE_DELAY_MS);
  });

  const handleMouseEnter: NoneToVoidFunction | undefined = !isTouchEnv
    ? _handleMouseEnter
    : undefined;
  const handleMouseLeave: NoneToVoidFunction | undefined = !isTouchEnv
    ? _handleMouseLeave
    : undefined;

  return { isButtonVisible, handleMouseEnter, handleMouseLeave };
}
