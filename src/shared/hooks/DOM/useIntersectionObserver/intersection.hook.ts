import { useRef, useEffect, RefObject, useState } from "react";
import { useStableCallback } from "../../base";
import { IntersectionController } from "./intersection.controller";
import { Scheduler } from "@/lib/core";
import { TargetCallback, ObserveFn } from ".";
import useHeavyAnimationCheck from "@/lib/hooks/sensors/useHeavyAnimationCheck";

interface IntersectionProps {
  rootRef: RefObject<Element | null>;
  throttleMs?: number;
  throttleScheduler?: Scheduler;
  debounceMs?: number;
  shouldSkipFirst?: boolean;
  margin?: number;
  threshold?: number | number[];
  isDisabled?: boolean;
}

interface IntersectionResponse {
  observe: ObserveFn;
  freeze: NoneToVoidFunction;
  unfreeze: NoneToVoidFunction;
}

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
  }: IntersectionProps,
  rootCallback?: (entries: IntersectionObserverEntry[]) => void,
): IntersectionResponse {
  const controllerRef = useRef<IntersectionController | null>(null);

  useEffect(() => {
    if (isDisabled) return;

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [isDisabled]);

  // The observe function adds an element to the IntersectionObserver and
  // optionally registers a target-specific callback.
  const observe = useStableCallback(
    (target: Element, targetCallback?: TargetCallback): NoneToVoidFunction => {
      const root = rootRef.current;

      controllerRef.current = new IntersectionController({
        root,
        margin,
        threshold,
        throttleMs,
        throttleScheduler,
        debounceMs,
        shouldSkipFirst,
        rootCallback,
      });

      const controller = controllerRef.current!;

      controller.observer.observe(target);

      if (targetCallback) {
        controller.addCallback(target, targetCallback);
      }

      return () => {
        if (targetCallback) {
          controller.removeCallback(target, targetCallback);
        }
        controller.observer.unobserve(target);
      };
    },
  );

  const freeze = useStableCallback(controllerRef.current?.freeze);
  const unfreeze = useStableCallback(controllerRef.current?.unfreeze);

  useHeavyAnimationCheck(freeze, unfreeze);

  return {
    observe,
    freeze,
    unfreeze,
  };
}

export function useOnIntersect(
  targetRef: RefObject<Element | null>,
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
  targetRef: RefObject<Element | null>,
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
