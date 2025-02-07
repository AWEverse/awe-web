import type { RefObject } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import useHeavyAnimationCheck from "../../../lib/hooks/sensors/useHeavyAnimationCheck";
import { useStableCallback } from "@/shared/hooks/base";
import {
  CallbackManager,
  createCallbackManager,
} from "../../../lib/utils/callbacks";
import { type Scheduler, debounce, throttleWith, throttle } from "@/lib/core";

type TargetCallback = (entry: IntersectionObserverEntry) => void;
type RootCallback = (entries: IntersectionObserverEntry[]) => void;

interface IntersectionController {
  observer: IntersectionObserver;
  addCallback: (element: HTMLElement, callback: TargetCallback) => void;
  removeCallback: (element: HTMLElement, callback: TargetCallback) => void;
  observeElement: (element: HTMLElement) => void;
  unobserveElement: (element: HTMLElement) => void;
  destroy: NoneToVoidFunction;
}

interface Response {
  observe: ObserveFn;
  freeze: NoneToVoidFunction;
  unfreeze: NoneToVoidFunction;
}

interface useIntersectionObserverProps {
  rootRef: RefObject<HTMLElement | null>;
  throttleMs?: number;
  throttleScheduler?: Scheduler;
  debounceMs?: number;
  shouldSkipFirst?: boolean;
  margin?: number;
  threshold?: number | number[];
  isDisabled?: boolean;
}

export type ObserveFn = (
  target: HTMLElement,
  targetCallback?: TargetCallback,
) => NoneToVoidFunction;

export function useIntersectionObserver(
  {
    rootRef,
    throttleMs,
    throttleScheduler,
    debounceMs,
    shouldSkipFirst,
    margin,
    threshold,
    isDisabled,
  }: useIntersectionObserverProps,
  rootCallback?: RootCallback,
): Response {
  const controllerRef = useRef<IntersectionController | undefined>(null);
  const rootCallbackRef = useRef<RootCallback | undefined>(undefined);
  const freezeFlagsRef = useRef(0);
  const onUnfreezeRef = useRef<NoneToVoidFunction | undefined>(undefined);
  const rootElement = rootRef.current;

  rootCallbackRef.current = rootCallback;

  const freeze = useStableCallback(() => {
    freezeFlagsRef.current++;
  });

  const unfreeze = useStableCallback(() => {
    if (freezeFlagsRef.current === 0) return;
    freezeFlagsRef.current--;

    if (freezeFlagsRef.current === 0 && onUnfreezeRef.current) {
      onUnfreezeRef.current();
      onUnfreezeRef.current = undefined;
    }
  });

  const initController = useCallback(() => {
    const callbacks = new Map<HTMLElement, CallbackManager<TargetCallback>>();
    const entriesAccumulator = new Map<Element, IntersectionObserverEntry>();
    const refCounts = new Map<HTMLElement, number>();

    const createProcessEntries = () => {
      return () => {
        if (freezeFlagsRef.current) {
          onUnfreezeRef.current = processEntries;
          return;
        }

        const entries = Array.from(entriesAccumulator.values());
        entriesAccumulator.clear();

        entries.forEach((entry) => {
          callbacks.get(entry.target as HTMLElement)?.runCallbacks(entry);
        });

        rootCallbackRef.current?.(entries);
      };
    };

    let processEntries: () => void;

    // Throttle/debounce configuration
    if (typeof throttleScheduler === "function") {
      processEntries = throttleWith(throttleScheduler, createProcessEntries());
    } else if (throttleMs) {
      processEntries = throttle(
        createProcessEntries(),
        throttleMs,
        !shouldSkipFirst,
      );
    } else if (debounceMs) {
      processEntries = debounce(
        createProcessEntries(),
        debounceMs,
        !shouldSkipFirst,
      );
    } else {
      processEntries = createProcessEntries();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entriesAccumulator.set(entry.target, entry));

        if (freezeFlagsRef.current) {
          onUnfreezeRef.current = processEntries;
        } else {
          processEntries();
        }
      },
      {
        root: rootElement as Element,
        rootMargin: margin ? `${margin}px` : undefined,
        threshold,
      },
    );

    const controller: IntersectionController = {
      observer,
      addCallback: (element, callback) => {
        if (!callbacks.has(element)) {
          callbacks.set(element, createCallbackManager());
        }
        callbacks.get(element)!.addCallback(callback);
      },
      removeCallback: (element, callback) => {
        const manager = callbacks.get(element);
        manager?.removeCallback(callback);
        if (manager && !manager.hasCallbacks()) callbacks.delete(element);
      },
      observeElement: (element) => {
        const count = refCounts.get(element) || 0;
        refCounts.set(element, count + 1);
        if (count === 0) observer.observe(element as Element);
      },
      unobserveElement: (element) => {
        const count = refCounts.get(element) || 0;
        if (count <= 1) {
          refCounts.delete(element);
          observer.unobserve(element as Element);
        } else {
          refCounts.set(element, count - 1);
        }
      },
      destroy: () => {
        callbacks.clear();
        refCounts.clear();
        observer.disconnect();
      },
    };

    return controller;
  }, [
    margin,
    threshold,
    rootElement,
    throttleMs,
    debounceMs,
    throttleScheduler,
    shouldSkipFirst,
  ]);

  useEffect(() => {
    if (isDisabled) return;
    const controller = initController();
    controllerRef.current = controller;
    return () => controller.destroy();
  }, [isDisabled, initController]);

  const observe: ObserveFn = useStableCallback((target, targetCallback) => {
    if (!controllerRef.current) return () => {};
    const controller = controllerRef.current;

    controller.observeElement(target);
    if (targetCallback) controller.addCallback(target, targetCallback);

    return () => {
      if (targetCallback) controller.removeCallback(target, targetCallback);
      controller.unobserveElement(target);
    };
  });

  useHeavyAnimationCheck(freeze, unfreeze);

  return { observe, freeze, unfreeze };
}

export function useOnIntersect(
  targetRef: RefObject<HTMLElement | null>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const lastCallback = useStableCallback(callback);

  useEffect(() => {
    if (!targetRef.current || !observe) return;
    return observe(targetRef.current, lastCallback);
  }, [lastCallback, observe, targetRef]);
}

export function useIsIntersecting(
  targetRef: RefObject<HTMLElement | null>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const [isIntersecting, setIsIntersecting] = useState(!observe);

  useOnIntersect(targetRef, observe, (entry) => {
    setIsIntersecting(entry.isIntersecting);
    callback?.(entry);
  });

  return isIntersecting;
}
