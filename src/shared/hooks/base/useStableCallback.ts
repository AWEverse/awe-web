import { useCallback, useEffect, useRef } from "react";
import useStateRef from "./useStateRef";

const NO_DEPS = [] as const;

/**
 * A hook that returns a stable callback reference which always calls the latest
 * provided function. It can update the callback reference either asynchronously
 * (default) or synchronously based on the options.
 *
 * @template T - A function type.
 * @param callback - The callback function whose latest version should be always used.
 *
 * @returns A stable callback that always uses the most recent version of `callback`.
 *
 * @example
 *
 * const handleClick = useStableCallback((event) => {
 *   // event handler logic
 * });
 *
 */
export default function <T extends AnyFunction>(
  callback?: T
): T {
  const callbackRef = useStateRef(callback);

  const stableCallback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    if (callbackRef.current === undefined) {
      return undefined as unknown as ReturnType<T>;
    }

    return callbackRef.current(...args);
  }, NO_DEPS);

  return stableCallback as T;
}
