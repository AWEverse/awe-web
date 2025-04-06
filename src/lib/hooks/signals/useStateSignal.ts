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
  const _isUpdating = useRef(false); // Flag to prevent re-entrant updates
  const _lastValue = useRef<T | undefined>(initialValue); // Track last processed value

  useComponentWillUnmount(() => {
    _isMounted.current = false;
  });

  const setSignal: SignalSetter<T> = useStableCallback((value) => {
    // Prevent re-entrant updates (cycle guard)
    if (_isUpdating.current) {
      if (DEBUG && logMessage) {
        console.warn(`useSignal: Cycle detected in ${logMessage}, skipping update`);
      }
      return;
    }

    const currentValue = _signal.current.value;

    const newValue =
      typeof value === "function"
        ? (value as (prevValue: T | undefined) => T)(currentValue)
        : value;

    if (areDeepEqual(newValue, _lastValue.current)) {
      return;
    }

    if (newValue instanceof Promise) {
      _isUpdating.current = true;
      newValue
        .then((resolvedValue) => {
          if (!_isMounted.current) return;
          if (!areDeepEqual(resolvedValue, _lastValue.current)) {
            updateSignal(resolvedValue);
          }
        })
        .catch((error) => {
          if (_isMounted.current) {
            handleSignalError(error, currentValue);
          }
        })
        .finally(() => {
          _isUpdating.current = false;
        });
    } else {
      _isUpdating.current = true;
      updateSignal(newValue);
      _isUpdating.current = false;
    }
  });

  const updateSignal = (newValue: T) => {
    if (DEBUG && logMessage) {
      console.log(`useSignal: ${logMessage}`, newValue);
    }
    _signal.current.value = newValue;
    _lastValue.current = newValue; // Update last processed value
  };

  const handleSignalError = (error: unknown, previousValue: T | undefined) => {
    if (DEBUG && logMessage) {
      console.error(`useSignal error: ${logMessage}`, error);
    }
    _signal.current.value = previousValue;
    _lastValue.current = previousValue; // Restore last stable value
  };

  return [_signal.current as ReadonlySignal<T>, setSignal];
}
