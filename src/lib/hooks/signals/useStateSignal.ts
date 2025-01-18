import { DEBUG } from "@/lib/config/dev";
import { ReadonlySignal, Signal, signal } from "@/lib/core/public/signals";
import { areDeepEqual } from "@/lib/utils/areDeepEqual";
import { useRef } from "react";
import useLastCallback from "../events/useLastCallback";

type SignalSetter<T> = (
  value: T | ((prevValue: T | undefined) => T),
) => Promise<void> | void;

type SignalReturn<T> = [ReadonlySignal<T>, SignalSetter<T>];

export default function useStateSignal<T = null>(
  value?: T,
  logMessage?: string,
): SignalReturn<T> {
  const _signal = useRef<Signal<T | undefined>>(signal<T | undefined>(value));

  const previous = useRef<T>(value);

  const setSignal: SignalSetter<T> = useLastCallback(async (value) => {
    try {
      const prevValue = _signal.current.value;
      previous.current = prevValue;

      let newValue: T;

      // If a function is provided, use it to calculate the new value
      if (typeof value === "function") {
        const setter = value as (prevValue: T | undefined) => T;

        newValue = setter(prevValue);
      } else {
        newValue = value;
      }

      // Await for promise if new value is a promise
      if (newValue instanceof Promise) {
        newValue = await newValue;
      }

      // Current signals didn't use large objects, and to be honest objects at all.
      // So compatibility checking is easy for === primitives ​​and not so much for arrays
      //
      // Skip update if the value is not different (optimized deep equality check)
      if (!areDeepEqual(newValue, prevValue)) {
        logMessage &&
          DEBUG &&
          console.log(
            "useSignal.ts: Changes detected. Signal value updated: " +
              logMessage,
          );

        _signal.current.value = newValue;
      }
    } catch (error) {
      logMessage &&
        DEBUG &&
        console.error("useSignal.ts: Error updating signal value:", error);

      _signal.current.value = previous.current;
    }
  });

  return [_signal.current as ReadonlySignal<T>, setSignal] as const;
}
