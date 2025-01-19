import { useState, useRef } from "react";
import useStableCallback from "../base/useStableCallback";

interface ForceUpdateOptions {
  callback?: () => void;
  throttleInterval?: number;
}

/**
 * Custom hook that provides a function to trigger a component re-render
 * with optional callback execution and throttle control.
 *
 * This hook helps in triggering a re-render without directly modifying the state.
 * It also includes an option to limit the frequency of re-renders by using a throttle
 * interval and executes an optional callback function after the re-render.
 *
 * @param {Object} options - Optional configuration object.
 * @param {Function} options.callback - A callback function to be executed after the re-render.
 * @param {number} options.throttleInterval - The minimum time, in milliseconds, between each call to the returned function.
 *
 * @returns {Function} A function that, when called, triggers a re-render of the component.
 */
const useTriggerReRender = ({
  callback,
  throttleInterval,
}: ForceUpdateOptions = {}): (() => void) => {
  const [, setTick] = useState<number>(0);
  const lastCallRef = useRef<number>(0);

  /**
   * This function triggers a re-render of the component and optionally runs a callback
   * after the re-render. It respects the throttle interval, ensuring that re-renders
   * don't happen more frequently than the specified interval.
   */
  const triggerReRender = useStableCallback((): void => {
    const now = Date.now();

    if (throttleInterval && now - lastCallRef.current < throttleInterval) {
      return;
    }

    lastCallRef.current = now;

    setTick((tick) => tick + 1);
    callback?.();
  });

  return triggerReRender;
};

export default useTriggerReRender;
