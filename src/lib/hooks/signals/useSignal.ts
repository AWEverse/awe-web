import { Signal, signal } from "@/lib/core/public/signals";
import { useMemo } from "react";

type TFunc<T> = () => T;

/**
 * useSignal
 * Creates a reactive signal. Supports optional initial value or lazy initializer.
 * SSR-safe: signal is memoized per render cycle.
 *
 * @param initial Initial value or lazy initializer function.
 * @returns A Signal<T>
 */
export default function useSignal<T = undefined>(): Signal<T | undefined>;
export default function useSignal<T>(initial: T | (TFunc<T>)): Signal<T>;
export default function useSignal<T>(initial?: T | (TFunc<T>)) {
  return useMemo(() => {
    if (typeof initial === "function") {
      return signal((initial as TFunc<T>)());
    }

    return signal(initial);
  }, [] as const);
}

