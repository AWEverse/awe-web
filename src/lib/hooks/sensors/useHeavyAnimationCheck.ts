import { useCallback, useEffect, useMemo, useRef } from "react";
import { fastRaf } from "@/lib/core";

function createThrottledCallbackManager() {
  const callbacks = new Set<NoneToVoidFunction>();
  let isProcessing = false;

  return {
    addCallback: (callback: NoneToVoidFunction) => {
      callbacks.add(callback);
    },
    removeCallback: (callback: NoneToVoidFunction) => {
      callbacks.delete(callback);
    },
    runCallbacks: () => {
      if (isProcessing) return;
      isProcessing = true;

      const processNext = () => {
        if (callbacks.size === 0) {
          isProcessing = false;
          return;
        }

        const callback = callbacks.values().next().value;
        if (callback) {
          callbacks.delete(callback);
          callback();
          fastRaf(processNext);
        } else {
          isProcessing = false;
        }
      };

      processNext();
    },
  };
}

const startCallbacks = createThrottledCallbackManager();
const endCallbacks = createThrottledCallbackManager();

getIsHeavyAnimating.subscribe((isHeavy) => {
  (isHeavy ? startCallbacks : endCallbacks).runCallbacks();
});

export function useHeavyAnimationCheck(
  onStart = () => { },
  onEnd = () => { },
  isDisabled = false
) {
  const lastOnStart = useRef(onStart).current;
  const lastOnEnd = useRef(onEnd).current;

  useEffect(() => {
    if (isDisabled) return;

    if (getIsHeavyAnimating.value) lastOnStart();

    startCallbacks.addCallback(lastOnStart);
    endCallbacks.addCallback(lastOnEnd);

    return () => {
      startCallbacks.removeCallback(lastOnStart);
      endCallbacks.removeCallback(lastOnEnd);
    };
  }, [isDisabled, lastOnStart, lastOnEnd]);
}

export function useThrottledAnimation<T extends (...args: any[]) => void>(
  afterHeavyAnimation: T,
  deps: unknown[]
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
          endCallbacks.addCallback(() => {
            try {
              fnMemo(...args);
            } finally {
              isScheduledRef.current = false;
            }
          });
        }
      },
    [fnMemo]
  );
}

export default useHeavyAnimationCheck;
