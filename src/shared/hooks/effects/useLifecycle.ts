import { EffectCallback, useEffect } from "react";

const NO_DEPS = [] as const;

/**
 * Runs a one-time effect when the component mounts (similar to componentDidMount).
 *
 * @param effect - The effect callback to execute on mount
 */
export function useComponentDidMount(effect: EffectCallback) {
  useEffect(() => {
    effect();
    // No cleanup needed for mount-only effect
  }, NO_DEPS); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Runs a cleanup effect when the component unmounts (similar to componentWillUnmount).
 *
 * @param cleanupEffect - The cleanup callback to execute on unmount
 */
export function useComponentWillUnmount(cleanupEffect: () => void) {
  useEffect(() => {
    return cleanupEffect; // Return cleanup function directly
  }, NO_DEPS); // eslint-disable-line react-hooks/exhaustive-deps
}
