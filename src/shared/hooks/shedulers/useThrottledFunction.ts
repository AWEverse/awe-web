import { Scheduler, throttle, throttleWith } from "@/lib/core";
import { useCallback, useMemo } from "react";

/**
 * Custom hook to throttle a callback function with options for controlling
 * whether the function is called on the leading edge of the throttle interval.
 *
 * The returned function will only be invoked at most once per specified
 * interval (`msOrSchedulerFn`), with the option to disable the first invocation.
 *
 * @param {AnyToVoidFunction} fn - The callback function to throttle.
 * @param {Array} deps - The dependency array that will trigger re-creation of the throttled function.
 * @param {number | Scheduler} msOrSchedulerFn - The throttle delay in milliseconds or a custom scheduler function.
 * @param {boolean} [noFirst=false] - Whether to disable the first invocation (on the leading edge).
 *
 * @returns {AnyToVoidFunction} The throttled version of the provided callback function.
 */
export default function useThrottledFunction<T extends AnyToVoidFunction>(
  fn: T,
  deps: any[],
  msOrSchedulerFn: number | Scheduler,
  noFirst = false,
): AnyToVoidFunction {
  const fnMemo = useCallback(fn, deps);

  // Return the throttled function based on the type of `msOrSchedulerFn`
  return useMemo(() => {
    if (typeof msOrSchedulerFn === "number") {
      return throttle(fnMemo, msOrSchedulerFn, !noFirst);
    } else {
      return throttleWith(msOrSchedulerFn, fnMemo);
    }
  }, [fnMemo, msOrSchedulerFn, noFirst]);
}
