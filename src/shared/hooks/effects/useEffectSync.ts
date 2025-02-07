import { useCallback, useEffect, useRef } from "react";

import { usePrevious } from "../base";
import { useComponentWillUnmount } from "./useLifecycle";

const NO_DEPS = [] as const;

export default function <const T extends Readonly<AnyArray>>(
  effect: (args: T | readonly []) => NoneToVoidFunction | void,
  deps: T,
) {
  const prevDeps = usePrevious<T>(deps);
  const cleanupRef = useRef<NoneToVoidFunction | undefined>(null);

  const memoizedEffect = useCallback(() => {
    if (
      !prevDeps ||
      deps.some((currentDep, index) => currentDep !== prevDeps[index])
    ) {
      cleanupRef.current?.();
      cleanupRef.current = effect(prevDeps || NO_DEPS) ?? undefined;
    }
  }, [deps, prevDeps, effect]);

  useEffect(() => {
    memoizedEffect();
  }, [memoizedEffect]);

  useComponentWillUnmount(() => {
    cleanupRef.current?.();
  });
}
