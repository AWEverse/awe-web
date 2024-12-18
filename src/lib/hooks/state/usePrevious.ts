import { useRef } from 'react';

export default function usePrevious<T>(current: T): T | undefined {
  const prevRef = useRef<T>();
  const lastRef = useRef<T>();

  if (lastRef.current !== current) {
    prevRef.current = lastRef.current;
  }

  lastRef.current = current;

  return prevRef.current;
}
