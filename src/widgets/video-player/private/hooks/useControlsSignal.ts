import { useRef } from 'react';
import useLastCallback from '@/lib/hooks/events/useLastCallback';

export type InsensitiveSignal<T> = [T, (value: T) => void, (value: T) => void];

const useControlsSignal = (): InsensitiveSignal<boolean> => {
  const visibilityRef = useRef(false);
  const lockedRef = useRef(false);

  const getVisible = !lockedRef.current && visibilityRef.current;

  const setControlsVisible = useLastCallback((value: boolean) => {
    visibilityRef.current = value;
  });

  const setIsLocked = useLastCallback((value: boolean) => {
    lockedRef.current = value;
  });

  return [getVisible, setControlsVisible, setIsLocked];
};

export default useControlsSignal;
