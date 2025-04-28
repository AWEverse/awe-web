import {
  useRef,
  useEffect,
  RefObject,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useStableCallback } from "../../base";
import { IntersectionController } from "./intersection.controller";
import { Scheduler } from "@/lib/core";
import { TargetCallback, ObserveFn } from ".";
import useBackgroundMode from "@/lib/hooks/ui/useBackgroundMode";

// Props for configuring the Intersection Observer
interface IntersectionProps {
  rootRef: RefObject<Element | null>;
  throttleMs?: number;
  throttleScheduler?: Scheduler;
  debounceMs?: number;
  margin?: number;
  threshold?: number | number[];
  isDisabled?: boolean;
}

interface IntersectionResponse {
  observe: ObserveFn;
  freeze: () => void;
  unfreeze: () => void;
}

/**
 * Hook to manage Intersection Observer instances.
 * Returns functions to observe elements, freeze, and unfreeze the observer.
 */
export function useIntersectionObserver(
  {
    rootRef,
    throttleMs,
    throttleScheduler,
    debounceMs,
    margin,
    threshold,
    isDisabled,
  }: IntersectionProps,
  rootCallback?: (entries: IntersectionObserverEntry[]) => void,
): IntersectionResponse {
  const controllerRef = useRef<IntersectionController | null>(null);

  useEffect(() => {
    if (isDisabled) {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      return;
    }

    const root = rootRef.current;
    controllerRef.current = new IntersectionController({
      root,
      margin,
      threshold,
      throttleMs,
      throttleScheduler,
      debounceMs,
      rootCallback,
    });

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [
    rootRef,
    margin,
    threshold,
    throttleMs,
    throttleScheduler,
    debounceMs,
    rootCallback,
    isDisabled,
  ]);

  const observe = useStableCallback(
    (target: Element, targetCallback?: TargetCallback): (() => void) => {
      if (isDisabled || !controllerRef.current) return () => { };

      const controller = controllerRef.current;
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

  const freeze = useStableCallback(() => controllerRef.current?.freeze());
  const unfreeze = useStableCallback(() => controllerRef.current?.unfreeze());

  // useBackgroundMode(freeze, unfreeze)

  return { observe, freeze, unfreeze };
}

/**
 * Hook to observe an element's intersection when it mounts.
 * Automatically unsubscribes on unmount.
 */
export function useOnIntersect(
  targetRef: RefObject<Element | null>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const stableCallback = useStableCallback(callback);

  useEffect(() => {
    if (!targetRef.current || !observe) return;

    const unsubscribe = observe(targetRef.current, stableCallback);
    return unsubscribe;
  }, [stableCallback, observe, targetRef]);
}

/**
 * Hook to determine if an element is intersecting.
 * Returns a boolean indicating intersection state.
 */
export function useIsIntersecting(
  targetRef: RefObject<Element | null>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const intersectionRef = useRef<boolean>(!observe);
  const stableCallback = useStableCallback(callback);

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!targetRef.current || !observe) return () => { };

      const unsubscribe = observe(targetRef.current, (entry) => {
        intersectionRef.current = entry.isIntersecting;
        notify();
        stableCallback?.(entry);
      });

      return unsubscribe;
    },
    [targetRef, observe, stableCallback],
  );

  const getSnapshot = useStableCallback(() => intersectionRef.current);
  const getServerSnapshot = useStableCallback(() => false); // SSR fallback

  const isIntersecting = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return isIntersecting;
}
