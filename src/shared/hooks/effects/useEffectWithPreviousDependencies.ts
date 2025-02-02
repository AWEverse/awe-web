import { EffectCallback, useEffect, useLayoutEffect, useRef } from "react";

type ReadonlyArray<T = unknown> = readonly T[];

function useEffectWithPreviousDependenciesBase<const T extends ReadonlyArray>(
  callback: (previousDeps: T | ReadonlyArray) => void,
  effectHook: (effect: EffectCallback, deps?: T) => void,
  dependencies: T,
) {
  const previousDepsRef = useRef<T | ReadonlyArray>([]);

  effectHook(() => {
    const previousDeps = previousDepsRef.current;
    // Update ref before execution to ensure fresh values in potential cleanups
    previousDepsRef.current = dependencies;

    callback(previousDeps);

    // Clear ref on unmount to prevent stale closures
    return () => {
      previousDepsRef.current = [];
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
