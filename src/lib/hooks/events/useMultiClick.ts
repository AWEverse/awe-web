import { useCallback, useRef } from 'react';

const CLICK_TIMEOUT = 300;

export default function useMultiClick(clickTimeout = CLICK_TIMEOUT, amount: number, callback: NoneToVoidFunction) {
  const currentAmountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(() => {
    currentAmountRef.current++;

    if (currentAmountRef.current === amount) {
      currentAmountRef.current = 0;
      callback();
      clearTimeout(timeoutRef.current!);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      currentAmountRef.current = 0;
    }, clickTimeout);
  }, [amount, callback, clickTimeout]);

  return handleClick;
}
