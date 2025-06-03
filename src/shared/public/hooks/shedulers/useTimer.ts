import { useEffect } from "react";
import useStableCallback from "../base/useStableCallback";

/**
 * Base hook for setting up a timer (either timeout or interval).
 *
 * @param {Function} callback - The callback to be executed after the timer elapses.
 * @param {number} delay - The delay (in ms) for the timer. For `setTimeout` it’s a one-time execution, for `setInterval` it repeats.
 * @param {boolean} isInterval - Whether the timer should be a repeating interval (`setInterval`) or a one-time timeout (`setTimeout`).
 * @param {boolean} noFirst - Whether to skip the first immediate callback execution (used for intervals).
 */
function useTimer(
  callback: NoneToVoidFunction,
  delay?: number,
  isInterval: boolean = false,
  noFirst: boolean = false,
) {
  const savedCallback = useStableCallback(callback);

  useEffect(() => {
    if (typeof delay !== "number") return;

    const timerId = isInterval
      ? setInterval(() => savedCallback(), delay)
      : setTimeout(() => savedCallback(), delay);

    if (isInterval && !noFirst) {
      savedCallback();
    }

    return () => clearTimeout(timerId);
  }, [delay, isInterval, noFirst, savedCallback]);
}

/**
 * Custom hook for setting a timeout.
 *
 * @param {Function} callback - The callback to be executed after the delay.
 * @param {number} delay - The delay in milliseconds after which the callback will be invoked.
 */
export function useTimeout(callback: NoneToVoidFunction, delay?: number) {
  useTimer(callback, delay, false);
}

/**
 * Custom hook for setting an interval.
 *
 * @param {Function} callback - The callback to be executed at intervals.
 * @param {number} delay - The delay in milliseconds for the interval.
 * @param {boolean} noFirst - Whether to skip the first execution of the callback immediately after the hook is triggered.
 */
export function useInterval(
  callback: NoneToVoidFunction,
  delay?: number,
  noFirst: boolean = false,
) {
  useTimer(callback, delay, true, noFirst);
}
