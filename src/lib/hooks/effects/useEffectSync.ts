import { useRef } from 'react';

import useEffectOnce from './useEffectOnce';
import usePrevious from '../state/usePrevious';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function <const T extends readonly any[]>(
  effect: (args: T | readonly []) => NoneToVoidFunction | void,
  dependencies: T,
) {
  const prevDeps = usePrevious<T>(dependencies);
  const cleanupRef = useRef<NoneToVoidFunction>();

  if (!prevDeps || dependencies.some((d, i) => d !== prevDeps[i])) {
    cleanupRef.current?.();
    cleanupRef.current = effect(prevDeps || []) ?? undefined;
  }

  useEffectOnce(() => {
    return () => {
      cleanupRef.current?.();
    };
  });
}
