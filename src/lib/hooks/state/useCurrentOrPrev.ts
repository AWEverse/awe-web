import { useRef, useEffect } from 'react';

/**
 * Hook to store and update the current or previous value.
 * @param value The current value.
 * @returns The previous value.
 */
const useCurrentOrPrev = <T>(value: T): T | undefined => {
  const prevRef = useRef<T>(undefined);
  const currentRef = useRef<T>(value);

  useEffect(() => {
    prevRef.current = currentRef.current;
    currentRef.current = value;
  }, [value]);

  return prevRef.current;
};

export default useCurrentOrPrev;
