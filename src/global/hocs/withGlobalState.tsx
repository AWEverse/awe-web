import React, { useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../core";
import type { FC, ComponentType } from "react";

// Enhanced utility types for better type inference
export type MapStateToProps<OwnProps, StateProps> = (
  state: RootState,
  ownProps: OwnProps,
) => StateProps;

export type MapDispatchToProps<OwnProps, DispatchProps> = (
  dispatch: AppDispatch,
  ownProps: OwnProps,
) => DispatchProps;

// Selector-based mapping for better performance
export type SelectorMapStateToProps<OwnProps, StateProps> =
  | ((state: RootState, ownProps: OwnProps) => StateProps)
  | ReturnType<typeof createSelector>;

// Factory function type for dispatch mapping
export type DispatchFactory<OwnProps, DispatchProps> = (
  dispatch: AppDispatch,
) => (ownProps: OwnProps) => DispatchProps;

// Options for HOC configuration
export interface WithGlobalStateOptions {
  /** Use shallow equality check for state props (default: true) */
  useShallowEqual?: boolean;
  /** Memoize dispatch props (default: true) */
  memoizeDispatch?: boolean;
  /** Use React.memo for the wrapped component (default: true) */
  memoComponent?: boolean;
  /** Custom equality function for state comparison */
  equalityFn?: (left: any, right: any) => boolean;
  /** Display name for debugging */
  displayName?: string;
  /** Enable prop changes tracking for debugging */
  trackPropChanges?: boolean;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
}

// Performance monitoring utilities
const createPerformanceTracker = (componentName: string) => {
  let renderCount = 0;
  let lastRenderTime = Date.now();

  return {
    onRender: () => {
      renderCount++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      lastRenderTime = now;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `${componentName} render #${renderCount}, time since last: ${timeSinceLastRender}ms`,
        );
      }
    },
    getRenderCount: () => renderCount,
  };
};

// Enhanced equality checks
const createEqualityChecker = (options: WithGlobalStateOptions) => {
  if (options.equalityFn) return options.equalityFn;
  if (options.useShallowEqual !== false) return shallowEqual;
  return undefined;
};

// Props change tracker for debugging
const createPropTracker = <T extends object>(componentName: string) => {
  const prevPropsRef = useRef<T | undefined>(undefined);

  return useCallback(
    (currentProps: T) => {
      if (process.env.NODE_ENV === "development" && prevPropsRef.current) {
        const changes: Array<{ key: string; old: any; new: any }> = [];

        Object.keys(currentProps).forEach((key) => {
          const typedKey = key as keyof T;
          if (currentProps[typedKey] !== prevPropsRef.current![typedKey]) {
            changes.push({
              key,
              old: prevPropsRef.current![typedKey],
              new: currentProps[typedKey],
            });
          }
        });

        if (changes.length > 0) {
          console.log(`${componentName} prop changes:`, changes);
        }
      }

      prevPropsRef.current = currentProps;
    },
    [componentName],
  );
};

// Enhanced types for better inference
export type InferStateProps<T> =
  T extends MapStateToProps<any, infer S> ? S : never;
export type InferDispatchProps<T> =
  T extends MapDispatchToProps<any, infer D> ? D : never;
export type InferOwnProps<T> =
  T extends MapStateToProps<infer O, any> ? O : never;

// Utility type for extracting component props
export type ExtractComponentProps<T> =
  T extends ComponentType<infer P> ? P : never;

// Enhanced HOC result type
export type EnhancedComponent<
  OwnProps extends object,
  StateProps extends object,
  DispatchProps extends object,
> = FC<OwnProps> & {
  WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>;
};

// Type-safe factory for creating selectors within HOC
export type SelectorWithOwnProps<OwnProps, StateProps> = (
  state: RootState,
  ownProps: OwnProps,
) => StateProps;

// Advanced factory type for complex dispatch mappings
export type AdvancedDispatchFactory<OwnProps, DispatchProps> = (
  dispatch: AppDispatch,
) => (ownProps: OwnProps) => DispatchProps;

// Overloads for different usage patterns
export function withGlobalState<
  OwnProps extends object,
  StateProps extends object,
>(
  mapStateToProps: MapStateToProps<OwnProps, StateProps>,
  options?: WithGlobalStateOptions,
): (WrappedComponent: ComponentType<OwnProps & StateProps>) => FC<OwnProps>;

export function withGlobalState<
  OwnProps extends object,
  StateProps extends object,
  DispatchProps extends object,
>(
  mapStateToProps: MapStateToProps<OwnProps, StateProps>,
  mapDispatchToProps: MapDispatchToProps<OwnProps, DispatchProps>,
  options?: WithGlobalStateOptions,
): (
  WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
) => FC<OwnProps>;

// Main implementation with enhanced performance and typing
export function withGlobalState<
  OwnProps extends object,
  StateProps extends object = {},
  DispatchProps extends object = {},
>(
  mapStateToProps: MapStateToProps<OwnProps, StateProps>,
  mapDispatchToPropsOrOptions?:
    | MapDispatchToProps<OwnProps, DispatchProps>
    | WithGlobalStateOptions,
  optionsArg?: WithGlobalStateOptions,
) {
  // Parse arguments based on overload pattern
  const mapDispatchToProps =
    typeof mapDispatchToPropsOrOptions === "function"
      ? (mapDispatchToPropsOrOptions as MapDispatchToProps<
          OwnProps,
          DispatchProps
        >)
      : undefined;

  const options: WithGlobalStateOptions = {
    useShallowEqual: true,
    memoizeDispatch: true,
    memoComponent: true,
    trackPropChanges: false,
    enablePerformanceMonitoring: false,
    ...((typeof mapDispatchToPropsOrOptions === "object"
      ? mapDispatchToPropsOrOptions
      : optionsArg) || {}),
  };

  return function wrapComponent(
    WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
  ): FC<OwnProps> {
    function WithStateAndDispatchComponent(props: OwnProps) {
      const dispatch = useDispatch<AppDispatch>();

      // Performance monitoring
      const performanceTracker = useMemo(() => {
        if (!options.enablePerformanceMonitoring) return null;
        const componentName =
          WrappedComponent.displayName || WrappedComponent.name || "Component";
        return createPerformanceTracker(componentName);
      }, []);

      // Prop change tracking
      const propTracker = options.trackPropChanges
        ? createPropTracker<OwnProps>(
            WrappedComponent.displayName ||
              WrappedComponent.name ||
              "Component",
          )
        : null;

      // Track prop changes
      if (propTracker) {
        propTracker(props);
      }

      // Create memoized selector with automatic reselect optimization
      const selector = useMemo(() => {
        return createSelector(
          [(state: RootState) => state, () => props],
          (state, ownProps) => mapStateToProps(state, ownProps),
        );
      }, [props]);

      // Use configured equality function
      const equalityFn = useMemo(
        () => createEqualityChecker(options),
        [options.equalityFn, options.useShallowEqual],
      );

      const stateProps = useSelector(selector, equalityFn);

      // Memoized dispatch props with optimized dependencies
      const dispatchProps = useMemo(
        () => {
          if (!mapDispatchToProps) return {} as DispatchProps;
          return mapDispatchToProps(dispatch, props);
        },
        options.memoizeDispatch ? [dispatch, props] : [],
      );

      // Performance monitoring
      if (performanceTracker) {
        performanceTracker.onRender();
      }

      // Combine all props
      const combinedProps = useMemo(
        () => ({
          ...props,
          ...stateProps,
          ...dispatchProps,
        }),
        [props, stateProps, dispatchProps],
      );

      return <WrappedComponent {...combinedProps} />;
    }

    // Set display name for debugging
    const componentName =
      WrappedComponent.displayName || WrappedComponent.name || "Component";

    WithStateAndDispatchComponent.displayName =
      options.displayName || `withGlobalState(${componentName})`;

    // Optionally memoize the entire component
    return options.memoComponent
      ? React.memo(WithStateAndDispatchComponent)
      : WithStateAndDispatchComponent;
  };
}
