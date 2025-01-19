import { ReadonlySignal, Signal } from "@/lib/core/public/signals";
import { DependencyList, useEffect, useLayoutEffect, useCallback } from "react";

type EffectType = typeof useEffect | typeof useLayoutEffect;

type SharedSignal<T> = Signal<T> | ReadonlySignal<T>;

const NO_DEPS = [] as const;

const useSignalEffectBase = <T = any>(
  signal: SharedSignal<T>,
  fn: (value: T) => void,
  effectHook: EffectType,
  deps?: DependencyList,
) => {
  const memoizedFn = useCallback(fn, deps ?? NO_DEPS);

  effectHook(() => {
    const unsubscribe = signal.subscribe(memoizedFn);

    return () => {
      unsubscribe();
    };
  }, [signal, memoizedFn]);
};

const useSignalEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: (value: T) => void,
  deps?: DependencyList,
) => {
  useSignalEffectBase(signal, fn, useEffect, deps);
};

const useSignalLayoutEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: (value: T) => void,
  deps?: DependencyList,
) => {
  useSignalEffectBase(signal, fn, useLayoutEffect, deps);
};

export { useSignalEffect, useSignalLayoutEffect };
