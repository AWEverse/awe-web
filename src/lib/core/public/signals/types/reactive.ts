import { Signal, ISignalObject } from "../public/SignalsCore";

export type ReactiveObject<T> = T extends object ? ISignalObject<T> : Signal<T>;

export type DeepSignalObject<T> = {
  [K in keyof T]: T[K] extends object
  ? DeepSignalObject<T[K]> & Signal<T[K]>
  : Signal<T[K]>;
};

// Signal collections
export type SignalArray<T> = Signal<T[]>;
export type SignalMap<K, V> = Signal<Map<K, V>>;
export type SignalSet<T> = Signal<Set<T>>;
