import { useCallback, useRef } from "react";
import useStateRef from "./useStateRef";

const NO_DEPS = [] as const;

/**
 * Returns a stable function reference that always invokes the latest version
 * of the provided callback, without changing its identity between renders.
 *
 * This is useful for preventing unnecessary re-renders or re-subscriptions
 * in effects, intervals, or event handlers where you need the latest logic
 * but a persistent function reference.
 *
 * @template T - A function type.
 * @param callback - The latest callback function you want to use.
 * @returns A function with a stable identity that always delegates to the latest `callback`.
 *
 * @example
 * const handleClick = useStableCallback((event) => {
 *   // Always up-to-date event handler logic
 * });
 *
 * // Safe to use in effects or setInterval without deps:
 * useEffect(() => {
 *   window.addEventListener("resize", handleResize);
 *   return () => window.removeEventListener("resize", handleResize);
 * }, []); // ✅ no need to rebind due to stable reference
 *
 * // Also works with timers:
 * useEffect(() => {
 *   const id = setInterval(() => {
 *     tick(); // Always latest tick()
 *   }, 1000);
 *   return () => clearInterval(id);
 * }, []);
 *
 * @remarks
 * This hook is ideal when you want to avoid unnecessary re-subscriptions or re-creations
 * of event listeners, intervals, or callbacks in deeply memoized components.
 *
 * | Behavior                                      | useCallback        | useStableCallback         |
 * | -------------------------------------------- | ------------------ | ------------------------- |
 * | Stable reference across renders              | ❌ (if deps change) | ✅                        |
 * | Always invokes the latest callback logic     | ✅ (if deps given)  | ✅ (via `.current`)        |
 * | Safe for use in `setInterval`, `useEffect`   | ❌                  | ✅                        |
 * | Avoids unnecessary re-renders/subscriptions  | ❌                  | ✅                        |
 * | Ideal for timers, refs, async logic          | ❌                  | ✅                        |
 *
 * @note This does not replace `useCallback` for memoizing inline callbacks used in props,
 * but rather complements it when *identity stability* and *fresh logic* are both required.
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
