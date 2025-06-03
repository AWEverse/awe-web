import { useCallback, useMemo, useRef, useEffect } from "react";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./GlobalStore";
import { useAppSelector, useAppDispatch } from "./hooks";

/**
 * Hook for creating memoized selector with automatic optimization
 */
export function useMemoizedSelector<T>(
  selector: (state: RootState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const memoizedSelector = useMemo(() =>
    createSelector([selector], (result) => result),
    [selector]
  );

  return useAppSelector(memoizedSelector, equalityFn);
}

/**
 * Hook for creating parameterized selectors
 */
export function useParametrizedSelector<T, Args extends readonly unknown[]>(
  selectorFactory: (...args: Args) => (state: RootState) => T,
  args: Args,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const selector = useMemo(
    () => selectorFactory(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    args,
  );

  return useAppSelector(selector, equalityFn);
}

/**
 * Hook for creating typed actions
 */
export function useTypedActions<T extends Record<string, any>>(
  actionsFactory: (dispatch: AppDispatch) => T,
): T {
  const dispatch = useAppDispatch();

  return useMemo(() => actionsFactory(dispatch), [dispatch, actionsFactory]);
}

/**
 * Hook for tracking state changes with callback
 */
export function useStateChangeEffect<T>(
  selector: (state: RootState) => T,
  callback: (current: T, previous: T | undefined) => void,
  equalityFn?: (left: T, right: T) => boolean,
): void {
  const currentValue = useAppSelector(selector, equalityFn);
  const previousValueRef = useRef<T | undefined>(undefined);

  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (previousValueRef.current !== undefined || currentValue !== undefined) {
      stableCallback(currentValue, previousValueRef.current);
    }
    previousValueRef.current = currentValue;
  }, [currentValue, stableCallback]);
}

/**
 * Hook for creating selector with fallback value
 */
export function useSelectorWithFallback<T>(
  selector: (state: RootState) => T | undefined,
  fallback: T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  return useAppSelector(
    useMemo(() => createSelector(
      [selector],
      (value) => value ?? fallback,
    ), [selector, fallback]),
    equalityFn,
  );
}

/**
 * Composite hook for combining multiple selectors
 */
export function useCombinedSelectors<T extends Record<string, any>>(
  selectors: {
    [K in keyof T]: (state: RootState) => T[K];
  },
): T {
  const combinedSelector = useMemo(() => createSelector(
    Object.values(selectors) as Array<(state: RootState) => any>,
    (...values) => {
      const result = {} as T;
      const keys = Object.keys(selectors) as Array<keyof T>;
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      return result;
    },
  ), [selectors]);

  return useAppSelector(combinedSelector);
}

/**
 * Hook for optimized access to nested state properties
 */
export function useNestedState<
  K extends keyof RootState,
  P extends keyof RootState[K],
>(
  stateKey: K,
  propertyKey: P,
  equalityFn?: (left: RootState[K][P], right: RootState[K][P]) => boolean,
): RootState[K][P] {
  const selector = useMemo(() => createSelector(
    [(state: RootState) => state[stateKey]],
    (stateSlice) => stateSlice[propertyKey],
  ), [stateKey, propertyKey]);

  return useAppSelector(selector, equalityFn);
}

/**
 * Hook for creating a selector with dependencies
 */
export function useTypedSelector<T, Dependencies extends readonly unknown[]>(
  selectorFactory: (deps: Dependencies) => (state: RootState) => T,
  dependencies: Dependencies,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const selector = useMemo(
    () => selectorFactory(dependencies),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  );

  return useAppSelector(selector, equalityFn);
}
