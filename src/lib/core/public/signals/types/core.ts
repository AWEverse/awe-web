import { Signal, Computed, ReadonlySignal } from "../public/SignalsCore";

export type SignalLike<T> = Signal<T> | Computed<T> | ReadonlySignal<T>;
export type WritableSignal<T> = Signal<T>;
export type ReadableSignal<T> = ReadonlySignal<T> | Computed<T>;

export type SignalValue<T> = T extends SignalLike<infer U> ? U : T;

export type CleanupFn = () => void;

export const isSignal = <T>(value: any): value is Signal<T> =>
  value?.brand === Symbol.for("signals");

export const isComputed = <T>(value: any): value is Computed<T> =>
  value instanceof Computed;

export const isReadableSignal = <T>(value: any): value is ReadableSignal<T> =>
  isSignal(value) || isComputed(value);
