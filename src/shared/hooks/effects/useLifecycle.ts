import { EffectCallback, useEffect } from "react";

/**
 * A constant representing an empty dependency array.
 * This is used to ensure that the effect runs only once on mount.
 * @private
 */
const EMPTY_DEPS = [] as const;

/**
 * Runs a one-time effect when the component mounts (similar to componentDidMount).
 *
 * @param effect - The effect callback to execute on mount
 */
export function useComponentDidMount(effect: EffectCallback) {
  useEffect(() => {
    effect();
  }, EMPTY_DEPS);
}

/**
 * Runs a cleanup effect when the component unmounts (similar to componentWillUnmount).
 *
 * @param cleanupEffect - The cleanup callback to execute on unmount
 */
export function useComponentWillUnmount(cleanupEffect: () => void) {
  useEffect(() => {
    return () => {
      cleanupEffect();
    };
  }, EMPTY_DEPS);
}
