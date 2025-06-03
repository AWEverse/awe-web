import { EffectCallback, useEffect, useLayoutEffect, useRef } from "react";

type ReadonlyArray<T = unknown> = readonly T[];

function useEffectWithPreviousDependenciesBase<
  const T extends ReadonlyArray<unknown>,
>(
  callback: (
    previousDeps: T | ReadonlyArray<unknown>,
  ) => ReturnType<EffectCallback>,
  effectHook: (effect: EffectCallback, deps?: T) => void,
  dependencies: T,
) {
  const cleanupRef = useRef<ReturnType<EffectCallback>>(undefined);
  const previousDepsRef = useRef<T | ReadonlyArray<unknown>>([]);

  effectHook(() => {
    const previousDeps = previousDepsRef.current;
    previousDepsRef.current = dependencies;
    cleanupRef.current = callback(previousDeps);

    return () => {
      cleanupRef.current?.();
    };
  }, dependencies);
}

export const useEffectWithPreviousDeps = <const T extends ReadonlyArray>(
  callback: (previousDeps: T | ReadonlyArray) => void,
  dependencies: T,
) => useEffectWithPreviousDependenciesBase(callback, useEffect, dependencies);

export const useLayoutEffectWithPreviousDeps = <const T extends ReadonlyArray>(
  callback: (previousDeps: T | ReadonlyArray) => void,
  dependencies: T,
) =>
  useEffectWithPreviousDependenciesBase(
    callback,
    useLayoutEffect,
    dependencies,
  );
