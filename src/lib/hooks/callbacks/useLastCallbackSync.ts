import { useRef, useCallback, useLayoutEffect } from "react";

/**
 * Custom hook that returns a callback that will always have the latest function.
 *
 * @param {T} callback - The function to be wrapped.
 * @returns {T} - The wrapped function.
 */
export function useLastCallbackSync<T extends AnyFunction>(callback: T): T {
  const callbackRef = useRef<T>(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current?.(...args),
    [],
  ) as T;
}
