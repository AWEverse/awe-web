import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Scheduler } from '../../utils/schedulers';
import { debounce, throttle, throttleWith } from '../../utils/schedulers';
import useHeavyAnimationCheck from './useHeavyAnimationCheck';
import useLastCallback from '../events/useLastCallback';
import { CallbackManager, createCallbackManager } from '../../utils/callbacks';

type TargetCallback = (entry: IntersectionObserverEntry) => void;
type RootCallback = (entries: IntersectionObserverEntry[]) => void;

interface IntersectionController {
  observer: IntersectionObserver;
  addCallback: (element: HTMLElement, callback: TargetCallback) => void;
  removeCallback: (element: HTMLElement, callback: TargetCallback) => void;
  destroy: NoneToVoidFunction;
}

interface Response {
  observe: ObserveFn;
  freeze: NoneToVoidFunction;
  unfreeze: NoneToVoidFunction;
}

interface useIntersectionObserverProps {
  rootRef: RefObject<HTMLDivElement>;
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
  const controllerRef = useRef<IntersectionController>();

  const rootCallbackRef = useRef<RootCallback>();
  const freezeFlagsRef = useRef(0);
  const onUnfreezeRef = useRef<NoneToVoidFunction>();

  rootCallbackRef.current = rootCallback;

  const freeze = useLastCallback(() => {
    freezeFlagsRef.current++;
  });

  const unfreeze = useLastCallback(() => {
    if (!freezeFlagsRef.current) {
      return;
    }

    freezeFlagsRef.current--;

    if (!freezeFlagsRef.current && onUnfreezeRef.current) {
      onUnfreezeRef.current();
      onUnfreezeRef.current = undefined;
    }
  });

  useHeavyAnimationCheck(freeze, unfreeze);

  useEffect(() => {
    if (isDisabled) {
      return undefined;
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.observer.disconnect();
        controllerRef.current.destroy();
        controllerRef.current = undefined;
      }
    };
  }, [isDisabled]);

  function initController() {
    const callbacks = new Map<HTMLElement, CallbackManager<TargetCallback>>();
    const entriesAccumulator = new Map<Element, IntersectionObserverEntry>();

    let observerCallback: typeof observerCallbackSync;

    if (typeof throttleScheduler === 'function') {
      observerCallback = throttleWith(throttleScheduler, observerCallbackSync);
    } else if (throttleMs) {
      observerCallback = throttle(observerCallbackSync, throttleMs, !shouldSkipFirst);
    } else if (debounceMs) {
      observerCallback = debounce(observerCallbackSync, debounceMs, !shouldSkipFirst);
    } else {
      observerCallback = observerCallbackSync;
    }

    function observerCallbackSync() {
      if (freezeFlagsRef.current) {
        onUnfreezeRef.current = observerCallback;
        return;
      }

      const entries = Array.from(entriesAccumulator.values());

      entries.forEach((entry: IntersectionObserverEntry) => {
        const callbackManager = callbacks.get(entry.target as HTMLElement);
        callbackManager?.runCallbacks(entry);
      });

      if (rootCallbackRef.current) {
        rootCallbackRef.current(entries);
      }

      entriesAccumulator.clear();
    }

    function addCallback(element: HTMLElement, callback: TargetCallback) {
      if (!callbacks.get(element)) {
        callbacks.set(element, createCallbackManager<TargetCallback>());
      }

      const callbackManager = callbacks.get(element)!;
      callbackManager.addCallback(callback);
    }

    function removeCallback(element: HTMLElement, callback: TargetCallback) {
      const callbackManager = callbacks.get(element);
      if (!callbackManager) return;
      callbackManager.removeCallback(callback);

      if (!callbackManager.hasCallbacks()) {
        callbacks.delete(element);
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entriesAccumulator.set(entry.target, entry);
        });

        if (freezeFlagsRef.current) {
          onUnfreezeRef.current = observerCallback;
        } else {
          observerCallback();
        }
      },
      {
        root: rootRef.current,
        rootMargin: margin ? `${margin}px` : undefined,
        threshold,
      },
    );

    function destroy() {
      callbacks.clear();
      observer.disconnect();
    }

    controllerRef.current = {
      observer,
      addCallback,
      removeCallback,
      destroy,
    };
  }

  const observe = useLastCallback((target, targetCallback) => {
    if (!controllerRef.current) {
      initController();
    }

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
  });

  return { observe, freeze, unfreeze };
}

export function useOnIntersect(
  targetRef: RefObject<HTMLDivElement>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const lastCallback = useLastCallback(callback);

  useEffect(() => {
    if (observe) {
      return observe(targetRef.current!, lastCallback);
    }
  }, [lastCallback, observe, targetRef]);
}

export function useIsIntersecting(
  targetRef: RefObject<HTMLDivElement>,
  observe?: ObserveFn,
  callback?: TargetCallback,
) {
  const [isIntersecting, setIsIntersecting] = useState(!observe);

  useOnIntersect(targetRef, observe, entry => {
    setIsIntersecting(entry.isIntersecting);

    if (callback) {
      callback(entry);
    }
  });

  return isIntersecting;
}
