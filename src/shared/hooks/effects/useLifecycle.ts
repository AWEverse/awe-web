import { EffectCallback, useEffect } from "react";

const NO_DEPS = [] as const;

/**
 * A custom hook that runs a one-time effect (componentDidMount) when the component is mounted.
 *
 * @param {EffectCallback} effect - The effect callback function that will be executed once on mount.
 */
export function useComponentDidMount(effect: EffectCallback) {
  // Using an empty dependency array to ensure the effect only runs once, similar to componentDidMount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, NO_DEPS);
}

/**
 * A custom hook that runs an effect during component unmount.
 *
 * @param {EffectCallback} cleanupEffect - The effect callback function that will be executed when the component unmounts.
 */
export function useComponentWillUnmount(cleanupEffect: NoneToVoidFunction) {
  useEffect(() => cleanupEffect, NO_DEPS);
}
