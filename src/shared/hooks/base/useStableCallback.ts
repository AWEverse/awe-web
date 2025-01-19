import { useCallback, useLayoutEffect, useRef } from "react";
import useStateRef from "./useStateRef";

const NO_DEPS = [] as const;

/**
 * Custom hook that returns a callback that will always have the latest function.
 *
 * This hook ensures that the callback reference is updated using `useStateRef`,
 * but the reference is preserved and doesn't change during the component lifecycle
 * unless explicitly set. This allows the callback to always have the latest logic
 * without being redefined on every render.
 *
 * @template T - A function type.
 * @param {T} [callback] - The function to be wrapped. This is the latest callback
 * that will be invoked when the returned callback is executed.
 *
 * @returns {T} - A stable version of the provided callback that maintains the latest
 * reference, without changing between renders.
 *
 * @example
 * const handleClick = useStableCallback((event) => {
 *   // event handler logic
 * });
 *
 * // `handleClick` won't change its reference between renders, but will
 * // always use the latest `callback` logic.
 */
export default function <T extends AnyFunction>(callback?: T): T {
  const ref = useStateRef(callback);

  // Use callback with stable reference, no dependencies needed
  return useCallback(
    (...args: Parameters<T>) => ref.current?.(...args),
    NO_DEPS,
  ) as T;
}

/**
 * Custom hook that returns a callback with a guaranteed synchronous update of the latest function.
 *
 * This hook ensures that the `callback` reference is updated synchronously using `useLayoutEffect`,
 * so the wrapped callback will always invoke the latest provided function, even if the component re-renders.
 *
 * This method is particularly useful when the timing of updates is critical, such as in animations,
 * DOM updates, or event handling that depends on the most recent version of the function.
 *
 * @template T - A function type.
 * @param {T} callback - The function to be wrapped. This callback will always hold
 * the latest logic and will be invoked when the returned callback is executed.
 *
 * @returns {T} - A stable version of the provided callback that always points to the
 * latest version of the original `callback`, without changing its reference between renders.
 *
 * @example
 * const handleScroll = useStableCallbackSync((event) => {
 *   // event handler logic that needs to sync with the DOM updates
 * });
 *
 * // `handleScroll` is stable, but always has the latest `callback` function logic
 * // when it is invoked during event handling.
 */
export function useStableCallbackSync<T extends AnyFunction>(callback: T): T {
  const callbackRef = useRef<T>(callback);

  // Synchronize the callback reference on every render using `useLayoutEffect`
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, NO_DEPS);

  // Return a stable callback with the latest `callbackRef`
  return useCallback(
    (...args: Parameters<T>) => callbackRef.current?.(...args),
    NO_DEPS,
  ) as T;
}
