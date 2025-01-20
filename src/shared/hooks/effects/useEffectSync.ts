import { useRef } from "react";

import { usePrevious } from "../base";
import { useComponentWillUnmount } from "./useLifecycle";

const NO_DEPS = [] as const;

export default function <const T extends Readonly<AnyArray>>(
  effect: (args: T | readonly []) => NoneToVoidFunction | void,
  deps: T,
) {
  const prevDeps = usePrevious<T>(deps);
  const cleanupRef = useRef<NoneToVoidFunction | undefined>(null);

  if (
    !prevDeps ||
    deps.some((currentDeps, order) => currentDeps !== prevDeps[order])
  ) {
    cleanupRef.current?.();
    cleanupRef.current = effect(prevDeps || NO_DEPS) ?? undefined;
  }

  useComponentWillUnmount(() => {
    cleanupRef.current?.();
  });
}
