import { Signal, signal } from "@/lib/core/public/signals";
import { useMemo } from "react";

export default function useSignal<T>(value: T): Signal<T>;
export default function useSignal<T = undefined>(): Signal<T | undefined>;
export default function useSignal<T>(value?: T) {
  return useMemo(() => signal<T | undefined>(value), [] as const);
}
