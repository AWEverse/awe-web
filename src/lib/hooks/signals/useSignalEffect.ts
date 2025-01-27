import { ReadonlySignal, Signal } from "@/lib/core/public/signals";
import { DependencyList, useEffect, useLayoutEffect, useCallback } from "react";

type EffectType = typeof useEffect | typeof useLayoutEffect;

type SharedSignal<T> = Signal<T> | ReadonlySignal<T>;

const NO_DEPS = [] as const;

type SharedSignalEffect<T = null> = (
  value: T,
) => ReturnType<React.EffectCallback>;

const useSignalEffectBase = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  effectHook: EffectType,
  deps: DependencyList = NO_DEPS,
) => {
  const memoizedFn = useCallback(
    () => fn(signal.value),
    [fn, signal.value, ...deps],
  );

  effectHook(() => {
    const unsubscribe = signal.subscribe(memoizedFn);

    return () => {
      const cleanup = memoizedFn();

      if (typeof cleanup === "function") {
        cleanup();
      }

      unsubscribe();
    };
  }, [signal, memoizedFn]);
};

const useSignalEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  deps?: DependencyList,
) => {
  useSignalEffectBase(signal, fn, useEffect, deps);
};

const useSignalLayoutEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  deps?: DependencyList,
) => {
  useSignalEffectBase(signal, fn, useLayoutEffect, deps);
};

export { useSignalEffect, useSignalLayoutEffect };
