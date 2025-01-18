import { DEBUG } from "@/lib/config/dev";
import useSignal from "@/lib/hooks/signals/useSignal";
import { areDeepEqual } from "@/lib/utils/areDeepEqual";
import { useRef, useCallback } from "react";

type SignalSetter<T> = (
  value: T | ((prevValue: T) => T),
) => Promise<void> | void;

function useContextSignal<T = null>(initialValue: T, logMessage?: string) {
  const signal = useSignal(initialValue);
  const previous = useRef<T>(initialValue);

  const setSignal: SignalSetter<T> = useCallback(
    async (value) => {
      try {
        const prevValue = signal.value;

        previous.current = prevValue;

        let newValue: T;
        if (typeof value === "function") {
          newValue = (value as (prevValue: T) => T)(prevValue);
        } else {
          newValue = value;
        }

        if (newValue instanceof Promise) {
          newValue = await newValue;
        }

        // Current signals didn't use large objects, and to be honest objects at all.
        // So compatibility checking is easy for === primitives ​​and not so much for arrays
        if (!areDeepEqual(newValue, prevValue)) {
          logMessage &&
            DEBUG &&
            console.log(
              "useContextSignal.ts: Changes detected. Signal value updated: " +
                logMessage,
            );

          signal.value = newValue;
        }
      } catch (error) {
        logMessage &&
          DEBUG &&
          console.error(
            "useContextSignal.ts: Error updating signal value:",
            error,
          );
        signal.value = previous.current;
      }
    },
    [signal],
  );

  return [signal, setSignal] as const;
}

export default useContextSignal;
