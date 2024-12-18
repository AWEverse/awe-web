import { createSignal, cleanupEffect, getActiveEffect } from '@/lib/modules/signals';
import { useState, useRef, useEffect, useCallback } from 'react';

export function useSignal<T>(defaultValue: T) {
  const [signal, setSignal] = useState<T>(defaultValue);

  const signalRef = useRef<ReturnType<typeof createSignal<T>>>();

  if (!signalRef.current) {
    signalRef.current = createSignal(defaultValue);
  }

  const [getterSignal, setterSignal] = signalRef.current;

  useEffect(() => {
    return () => {
      cleanupEffect(getActiveEffect()!);
    };
  }, []);

  const subscribe = useCallback(
    (effect: NoneToVoidFunction) => {
      return getterSignal.subscribe(effect);
    },
    [getterSignal],
  );

  const set = useCallback(
    (newValue: T) => {
      setterSignal(newValue);
      setSignal(newValue);
    },
    [setterSignal],
  );

  return { value: signal, set, subscribe };
}
