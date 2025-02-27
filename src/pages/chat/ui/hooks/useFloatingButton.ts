import { useState, useRef, useCallback, useEffect } from "react";

const BUTTON_CLOSE_DELAY_MS = 250;

export default function useFloatingButton(
  isTouchEnv: boolean,
  initialState = false,
) {
  const isMouseInsideRef = useRef(false);
  const closeTimeoutRef = useRef<number | undefined>(undefined);

  const [isButtonVisible, setIsButtonVisible] = useState(
    isTouchEnv ? initialState : false,
  );

  useEffect(() => {
    return () => clearTimeout(closeTimeoutRef.current);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isTouchEnv) return;

    isMouseInsideRef.current = true;
    setIsButtonVisible(true);
    clearTimeout(closeTimeoutRef.current);
  }, [isTouchEnv]);

  const handleMouseLeave = useCallback(() => {
    if (isTouchEnv) return;

    isMouseInsideRef.current = false;
    clearTimeout(closeTimeoutRef.current);

    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isMouseInsideRef.current) {
        setIsButtonVisible(false);
      }
    }, BUTTON_CLOSE_DELAY_MS);
  }, [isTouchEnv]);

  return {
    isButtonVisible,
    handleMouseEnter: !isTouchEnv ? handleMouseEnter : undefined,
    handleMouseLeave: !isTouchEnv ? handleMouseLeave : undefined,
  };
}
