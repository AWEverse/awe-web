import { useCallback, useEffect, useMemo, useRef } from "react";
import { createCallbackManager } from "../../utils/callbacks";
import useStableCallback from "../callbacks/useStableCallback";
import { getIsHeavyAnimating } from "@/lib/core";

const startCallbacks = createCallbackManager();
const endCallbacks = createCallbackManager();

getIsHeavyAnimating.subscribe((IsHeavyAnimating) => {
  (IsHeavyAnimating ? startCallbacks : endCallbacks).runCallbacks();
});

const useHeavyAnimationCheck = (
  onStart?: AnyToVoidFunction,
  onEnd?: AnyToVoidFunction,
  isDisabled = false,
) => {
  const lastOnStart = useStableCallback(onStart);
  const lastOnEnd = useStableCallback(onEnd);

  useEffect(() => {
    if (isDisabled) return;

    if (getIsHeavyAnimating.value) lastOnStart();

    startCallbacks.addCallback(lastOnStart);
    endCallbacks.addCallback(lastOnEnd);

    return () => {
      startCallbacks.removeCallback(lastOnStart);
      endCallbacks.removeCallback(lastOnEnd);
    };
  }, [isDisabled, lastOnEnd, lastOnStart]);
};

export function useThrottledAnimation<T extends AnyToVoidFunction>(
  afterHeavyAnimation: T,
  deps: unknown[],
) {
  const fnMemo = useCallback(afterHeavyAnimation, deps);
  const isScheduledRef = useRef(false);

  return useMemo(
    () =>
      (...args: Parameters<T>) => {
        if (isScheduledRef.current) return;

        if (!getIsHeavyAnimating.value) {
          fnMemo(...args);
        } else {
          isScheduledRef.current = true;

          const removeCallback = endCallbacks.addCallback(() => {
            fnMemo(...args);
            removeCallback();
            isScheduledRef.current = false;
          });
        }
      },
    [fnMemo],
  );
}

export default useHeavyAnimationCheck;
