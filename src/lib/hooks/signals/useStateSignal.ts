import { DEBUG } from "@/lib/config/dev";
import { ReadonlySignal, signal } from "@/lib/core/public/signals";
import { areDeepEqual } from "@/lib/utils/areDeepEqual";
import { useRef } from "react";
import { useStableCallback } from "@/shared/hooks/base";

type SignalSetter<T> = (value: T | ((prevValue: T | undefined) => T)) => void;

type SignalReturn<T> = [ReadonlySignal<T>, SignalSetter<T>];

export default function useStateSignal<T = null>(
  initialValue?: T,
  logMessage?: string,
): SignalReturn<T> {
  const _signal = useRef(signal<T | undefined>(initialValue));
  const _previous = useRef<T | undefined>(initialValue);

  const setSignal: SignalSetter<T> = useStableCallback((value) => {
    const prevValue = _signal.current.value;
    _previous.current = prevValue;

    let newValue: T;

    if (typeof value === "function") {
      newValue = (value as (prevValue: T | undefined) => T)(prevValue);
    } else {
      newValue = value;
    }

    // If the new value is a promise, handle it asynchronously
    if (newValue instanceof Promise) {
      newValue
        .then((resolvedValue) => {
          if (!areDeepEqual(resolvedValue, prevValue)) {
            updateSignal(resolvedValue);
          }
        })
        .catch((error) => handleSignalError(error));
    } else {
      if (!areDeepEqual(newValue, prevValue)) {
        updateSignal(newValue);
      }
    }
  });

  const updateSignal = (newValue: T) => {
    if (logMessage && DEBUG) {
      console.log(
        "useSignal.ts: Changes detected. Signal value updated: " + logMessage,
      );
    }
    _signal.current.value = newValue;
  };

  const handleSignalError = (error: any) => {
    if (logMessage && DEBUG) {
      console.error("useSignal.ts: Error updating signal value:", error);
    }

    _signal.current.value = _previous.current;
  };

  return [_signal.current as ReadonlySignal<T>, setSignal] as const;
}
