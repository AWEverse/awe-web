import { ReadonlySignal, Signal } from "@/lib/core/public/signals";
import {
  DependencyList,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";

type EffectType = typeof useEffect | typeof useLayoutEffect;
type SharedSignal<T> = Signal<T> | ReadonlySignal<T>;
type SharedSignalEffect<T = any> = (
  value: T,
) => ReturnType<React.EffectCallback>;

const useSignalEffectBase = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  effectHook: EffectType,
  deps: DependencyList = [],
) => {
  const cleanupRef = useRef<ReturnType<React.EffectCallback>>(undefined);
  const signalRef = useRef(signal);
  signalRef.current = signal;

  const stableFn = useCallback(fn, deps);

  effectHook(() => {
    const handleUpdate = () => {
      if (typeof cleanupRef.current === "function") {
        cleanupRef.current();
      }
      cleanupRef.current = stableFn(signalRef.current.value);
    };

    const unsubscribe = signalRef.current.subscribe(handleUpdate);

    handleUpdate();

    return () => {
      unsubscribe();
      if (typeof cleanupRef.current === "function") {
        cleanupRef.current();
      }
      cleanupRef.current = undefined;
    };
  }, [stableFn, signal]);
};

export const useSignalEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  deps?: DependencyList,
) => useSignalEffectBase(signal, fn, useEffect, deps);

export const useSignalLayoutEffect = <T = any>(
  signal: SharedSignal<T>,
  fn: SharedSignalEffect<T>,
  deps?: DependencyList,
) => useSignalEffectBase(signal, fn, useLayoutEffect, deps);
