import { useState, useRef } from 'react';
import { useEvent } from '../utilities/useEvent';

interface ForceUpdateOptions {
  callback?: () => void;
  throttleInterval?: number;
}

/**
 * Returns a function that, when called, triggers a re-render of the component.
 *
 * @param {Object} options - Optional configuration object.
 * @param {Function} options.callback - A callback function to be executed after the component re-renders.
 * @param {number} options.throttleInterval - The minimum time, in milliseconds, between each call to the returned function.
 * @returns {Function} A function that, when called, triggers a re-render of the component.
 */
const useForceUpdate = ({ callback, throttleInterval }: ForceUpdateOptions = {}): (() => void) => {
  const [, setTick] = useState<number>(0);
  const lastCallRef = useRef<number>(0);

  const forceUpdate = useEvent((): void => {
    const now = Date.now();

    if (throttleInterval && now - lastCallRef.current < throttleInterval) {
      return;
    }

    lastCallRef.current = now;

    setTick(tick => tick + 1);

    callback?.();
  });

  return forceUpdate;
};

export default useForceUpdate;
