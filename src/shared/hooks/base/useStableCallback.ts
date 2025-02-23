import { useCallback } from "react";
import useStateRef from "./useStateRef";

const NO_DEPS = [] as const;

interface UseStableCallbackOptions {
  /**
   * If true, the callback reference is updated synchronously with useLayoutEffect.
   * This is useful for cases where timing is critical (e.g., animations or layout effects).
   * Defaults to false, meaning the update happens asynchronously using useEffect.
   */
  sync?: boolean;
}

/**
 * A hook that returns a stable callback reference which always calls the latest
 * provided function. It can update the callback reference either asynchronously
 * (default) or synchronously based on the options.
 *
 * @template T - A function type.
 * @param callback - The callback function whose latest version should be always used.
 * @param options - Optional settings; set { sync: true } for synchronous updates.
 *
 * @returns A stable callback that always uses the most recent version of `callback`.
 *
 * @example
 * // Asynchronous update (default)
 * const handleClick = useStableCallback((event) => {
 *   // event handler logic
 * });
 *
 * // Synchronous update
 * const handleScroll = useStableCallback((event) => {
 *   // critical scroll handler logic
 * }, { sync: true });
 */
export default function useStableCallback<T extends AnyFunction>(
  callback?: T,
  options?: UseStableCallbackOptions,
): T {
  const { sync = false } = options || { sync: false };

  const callbackRef = useStateRef(callback);

  return useCallback((...args: Parameters<T>) => callbackRef.current?.(...args), NO_DEPS) as T;
}
