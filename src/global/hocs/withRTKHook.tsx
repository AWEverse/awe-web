import React from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";

/**
 * Enhanced RTK Query hook state interface
 */
interface RTKQueryState {
  data?: unknown;
  error?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

/**
 * Options for RTK Hook HOC
 */
interface WithRTKHookOptions {
  displayName?: string;
  skipWhen?: (props: unknown) => boolean;
  onError?: (error: unknown, props: unknown) => void;
  onSuccess?: (data: unknown, props: unknown) => void;
}

/**
 * A Higher-Order Component (HOC) that wraps a component with an RTK Query hook
 * (query or mutation), passing the hook's state as props with enhanced type safety.
 *
 * @param useHook - RTK Query hook (e.g., useQuery or useMutation).
 * @param mapArgs - Function to map component props to hook arguments or skipToken.
 * @param options - Additional configuration options.
 * @returns A wrapped component with hook state merged into its props.
 */
export function withRTKHook<
  OwnProps extends Record<string, unknown>,
  StateProps extends RTKQueryState,
  Hook extends (arg: unknown) => StateProps,
>(
  useHook: Hook,
  mapArgs: (props: OwnProps) => Parameters<Hook>[0] | typeof skipToken,
  options: WithRTKHookOptions = {},
): (
  Component: React.ComponentType<OwnProps & StateProps>,
) => React.FC<OwnProps> {
  const { displayName, skipWhen, onError, onSuccess } = options;

  return function createWrappedComponent(
    Component: React.ComponentType<OwnProps & StateProps>,
  ): React.FC<OwnProps> {
    const WrappedComponent = React.memo(function RTKWrapped(props: OwnProps) {
      // Check if we should skip the hook execution
      const shouldSkip = skipWhen?.(props) ?? false;
      const arg = shouldSkip ? skipToken : mapArgs(props);

      const stateProps = useHook(arg);

      // Handle success/error callbacks
      React.useEffect(() => {
        if (
          stateProps.isSuccess &&
          stateProps.data !== undefined &&
          onSuccess
        ) {
          onSuccess(stateProps.data, props);
        }
      }, [stateProps.isSuccess, stateProps.data, props]);

      React.useEffect(() => {
        if (stateProps.isError && stateProps.error && onError) {
          onError(stateProps.error, props);
        }
      }, [stateProps.isError, stateProps.error, props]);

      return <Component {...props} {...stateProps} />;
    });

    // Set display name for better debugging
    WrappedComponent.displayName =
      displayName ??
      `withRTKHook(${Component.displayName || Component.name || "Component"})`;

    return WrappedComponent;
  };
}

/**
 * Simplified version for quick usage without options
 */
export function withRTKQuery<
  OwnProps extends Record<string, unknown>,
  StateProps extends RTKQueryState,
  Hook extends (arg: unknown) => StateProps,
>(
  useHook: Hook,
  mapArgs: (props: OwnProps) => Parameters<Hook>[0] | typeof skipToken,
) {
  return withRTKHook(useHook, mapArgs);
}

/**
 * HOC for RTK mutations with enhanced error handling
 */
export function withRTKMutation<
  OwnProps extends Record<string, unknown>,
  StateProps extends RTKQueryState & {
    trigger?: (...args: unknown[]) => unknown;
  },
  Hook extends (arg?: unknown) => StateProps,
>(
  useMutation: Hook,
  options: WithRTKHookOptions & {
    autoTrigger?: (
      props: OwnProps,
    ) => Parameters<NonNullable<StateProps["trigger"]>> | null;
  } = {},
) {
  const { autoTrigger, ...hookOptions } = options;

  return function createMutationWrapper(
    Component: React.ComponentType<OwnProps & StateProps>,
  ): React.FC<OwnProps> {
    const WrappedComponent = React.memo(function RTKMutationWrapped(
      props: OwnProps,
    ) {
      const stateProps = useMutation();

      // Auto-trigger mutation if configured
      React.useEffect(() => {
        if (autoTrigger && stateProps.trigger) {
          const triggerArgs = autoTrigger(props);
          if (triggerArgs) {
            stateProps.trigger(...triggerArgs);
          }
        }
      }, [props, stateProps.trigger]);

      // Handle success/error callbacks
      React.useEffect(() => {
        if (
          stateProps.isSuccess &&
          stateProps.data !== undefined &&
          hookOptions.onSuccess
        ) {
          hookOptions.onSuccess(stateProps.data, props);
        }
      }, [stateProps.isSuccess, stateProps.data, props]);

      React.useEffect(() => {
        if (stateProps.isError && stateProps.error && hookOptions.onError) {
          hookOptions.onError(stateProps.error, props);
        }
      }, [stateProps.isError, stateProps.error, props]);

      return <Component {...props} {...stateProps} />;
    });

    WrappedComponent.displayName =
      hookOptions.displayName ??
      `withRTKMutation(${Component.displayName || Component.name || "Component"})`;

    return WrappedComponent;
  };
}
