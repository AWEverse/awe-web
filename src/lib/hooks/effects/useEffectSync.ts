import { useRef } from "react";

import useEffectOnce from "./useEffectOnce";
import usePrevious from "../state/usePrevious";

const NO_DEPS = [] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function <const T extends readonly any[]>(
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

  useEffectOnce(() => {
    return () => {
      cleanupRef.current?.();
    };
  });
}
