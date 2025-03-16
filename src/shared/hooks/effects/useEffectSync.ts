import { useCallback, useEffect, useRef } from "react";
import { usePrevious } from "../base";
import { useComponentWillUnmount } from "./useLifecycle";

const NO_DEPS = [] as const;

type CleanupFn = () => void;
type EffectFn<T extends readonly unknown[]> = (deps: T | typeof NO_DEPS) => void | CleanupFn;

/**
 * Custom effect hook that runs when dependencies change, with cleanup support.
 */
export default function useEffectSync<T extends readonly unknown[]>(
  effect: EffectFn<T>,
  deps: T
) {
  const prevDeps = usePrevious(deps);
  const cleanupRef = useRef<CleanupFn | undefined>(undefined);

  const runEffect = useCallback(() => {
    const hasChanged = !prevDeps || deps.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
      cleanupRef.current?.();
      cleanupRef.current = effect(prevDeps || NO_DEPS) || undefined;
    }
  }, [effect, deps, prevDeps]);

  useEffect(runEffect, [runEffect]);

  useComponentWillUnmount(() => {
    cleanupRef.current?.();
  });
}
