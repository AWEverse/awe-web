import { EffectCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Utility type for representing read-only arrays.
 */
type ReadonlyArrayOfAny = readonly any[];

/**
 * A utility function that manages effects (either useEffect or useLayoutEffect)
 * and passes previous dependencies to the provided callback.
 *
 * @template T - A readonly array type representing the dependencies.
 * @param {Function} callback - A function that receives the previous dependencies.
 * @param {Function} effectHook - The React effect hook (either useEffect or useLayoutEffect).
 * @param {T} dependencies - The array of current dependencies for the effect.
 */
function useEffectWithPreviousDependenciesBase<
  const T extends ReadonlyArrayOfAny,
>(
  callback: (previousDeps: T | readonly []) => void,
  effectHook: (effect: EffectCallback, deps?: T) => void,
  dependencies: T,
) {
  // Store the reference to the previous dependencies
  const previousDepsRef = useRef<T | null>(null);

  // Use the provided effect hook (useEffect or useLayoutEffect)
  effectHook(() => {
    const previousDeps = previousDepsRef.current;
    previousDepsRef.current = dependencies;

    // Execute the callback with previous dependencies or an empty array if no previous deps exist
    callback(previousDeps || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * A custom hook that uses `useEffect` and passes previous dependencies
 * to the provided callback function.
 *
 * @template T - A readonly array type representing the dependencies.
 * @param {Function} callback - A function that receives the previous dependencies.
 * @param {T} dependencies - The array of current dependencies for the effect.
 * @returns {void}
 */
export const useEffectWithPreviousDeps = <const T extends ReadonlyArrayOfAny>(
  callback: (previousDeps: T | readonly []) => void,
  dependencies: T,
): void =>
  useEffectWithPreviousDependenciesBase(callback, useEffect, dependencies);

/**
 * A custom hook that uses `useLayoutEffect` and passes previous dependencies
 * to the provided callback function.
 *
 * @template T - A readonly array type representing the dependencies.
 * @param {Function} callback - A function that receives the previous dependencies.
 * @param {T} dependencies - The array of current dependencies for the effect.
 * @returns {void}
 */
export const useLayoutEffectWithPreviousDeps = <
  const T extends ReadonlyArrayOfAny,
>(
  callback: (previousDeps: T | readonly []) => void,
  dependencies: T,
) =>
  useEffectWithPreviousDependenciesBase(
    callback,
    useLayoutEffect,
    dependencies,
  );
