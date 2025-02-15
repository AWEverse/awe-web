import { debounce } from "@/lib/core";
import React, { useCallback, useMemo } from "react";

/**
 * Custom hook to debounce a callback function with options for controlling
 * whether the function is called on the leading and trailing edges of the debounce.
 *
 * The returned function will only be invoked after the specified `ms` milliseconds
 * have passed since the last call, with the option to disable calls on the first
 * or last invocation.
 *
 * @param {AnyToVoidFunction} fn - The callback function to debounce.
 * @param {Array} deps - The dependency array that will trigger re-creation of the debounced function.
 * @param {number} ms - The debounce delay in milliseconds.
 * @param {boolean} [noFirst=false] - Whether to disable the first call (on the leading edge).
 * @param {boolean} [noLast=false] - Whether to disable the last call (on the trailing edge).
 *
 * @returns {AnyToVoidFunction} The debounced version of the provided callback function.
 */
export default function useDebouncedFunction<T extends AnyToVoidFunction>(
  fn: T,
  ms: number,
  noFirst: boolean = false,
  noLast: boolean = false,
  deps?: React.DependencyList,
): AnyToVoidFunction {
  const fnMemo = useCallback(fn, deps || ([] as const));

  // Return the debounced function, passing the necessary options for leading and trailing edge calls
  return useMemo(
    () => debounce(fnMemo, ms, !noFirst, !noLast),
    [fnMemo, ms, noFirst, noLast],
  );
}
