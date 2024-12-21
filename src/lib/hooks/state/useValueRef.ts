import { useRef } from 'react';
import useLastCallback from '../events/useLastCallback';

export default function useValueRef<T>(initialValue: T): [Readonly<T>, (newValue: T) => void] {
  const ref = useRef<T>(initialValue);

  const setValue = useLastCallback((newValue: T) => {
    ref.current = newValue;
  });

  return [ref.current as Readonly<T>, setValue];
}
