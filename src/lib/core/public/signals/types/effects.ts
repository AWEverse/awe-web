import { Signal } from "../public/SignalsCore";
import { CleanupFn, SignalLike } from "./core";

export type EffectCallback = () => void | CleanupFn;
export type EffectOptions = {
  lazy?: boolean;
  dependencies?: SignalLike<any>[];
};

export type SignalLifecycle<T> = {
  onCreate?: (signal: Signal<T>) => void;
  onUpdate?: (value: T, prev: T) => void;
  onDispose?: () => void;
};

export type WatcherCallback<T> = (value: T, prev: T | undefined) => void;
