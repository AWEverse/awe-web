import { Signal } from "../public/SignalsCore";
import { SignalValue } from "./core";
import { EffectCallback } from "./effects";
import { ReactiveObject } from "./reactive";

// Hook types
export type UseSignalHook<T> = () => [SignalValue<T>, (value: T) => void, Signal<T>];
export type UseComputedHook<T> = () => T;
export type UseEffectHook = (callback: EffectCallback, deps?: any[]) => void;
export type UseReactiveHook<T> = T extends object ? ReactiveObject<T> : Signal<T>;
