import { DEBUG } from "@/lib/config/dev";
import { ReadonlySignal, signal } from "@/lib/core/public/signals";
import { areDeepEqual } from "@/lib/utils/areDeepEqual";
import { useRef } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { useComponentWillUnmount } from "@/shared/hooks/effects/useLifecycle";

type SignalSetter<T> = (value: T | ((prevValue: T) => T)) => void;
type SignalReturn<T> = [ReadonlySignal<T>, SignalSetter<T>];

export default function useStateSignal<T = undefined>(
  initialValue?: T,
  logMessage?: string,
): SignalReturn<T> {
  const _signal = useRef(signal(initialValue));
  const _isMounted = useRef(true);

  useComponentWillUnmount(() => {
    _isMounted.current = false;
  });

  const setSignal: SignalSetter<T> = useStableCallback((value) => {
    const currentValue = _signal.current.value;

    const newValue =
      typeof value === "function"
        ? (value as (prevValue: T | undefined) => T)(currentValue)
        : value;

    if (newValue instanceof Promise) {
      newValue
        .then((resolvedValue) => {
          if (!_isMounted.current) return;
          if (!areDeepEqual(resolvedValue, _signal.current.value)) {
            updateSignal(resolvedValue);
          }
        })
        .catch((error) => {
          if (_isMounted.current) {
            handleSignalError(error, currentValue);
          }
        });
    } else if (!areDeepEqual(newValue, currentValue)) {
      updateSignal(newValue);
    }
  });

  const updateSignal = (newValue: T) => {
    if (DEBUG && logMessage) {
      console.log(`useSignal: ${logMessage}`, newValue);
    }
    _signal.current.value = newValue;
  };

  const handleSignalError = (error: unknown, previousValue: T | undefined) => {
    if (DEBUG && logMessage) {
      console.error(`useSignal error: ${logMessage}`, error);
    }
    _signal.current.value = previousValue;
  };

  return [_signal.current as ReadonlySignal<T>, setSignal];
}
