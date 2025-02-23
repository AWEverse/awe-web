import React, { ComponentType, FC, useMemo } from "react";

type WrappedReturn<O extends object, S extends object> = (
  WrappedComponent: ComponentType<O & S>,
) => FC<O>;

type PropsCallback<O extends object, S extends object> = (props: O) => S;

type Options = {
  cached?: boolean;
  memo?: boolean;
};

/**
 * A higher-order component (HOC) that maps state properties to props.
 * @param mapStateProps - A function that maps incoming props to state properties.
 * @param options - Options to control caching and memoization behavior.
 * @returns A HOC that enhances the input component with state properties.
 */
export default function withStateProps<
  O extends object = any,
  S extends object = any,
>(
  mapStateProps: PropsCallback<O, S>,
  options: Options = {
    cached: false,
    memo: false,
  },
): WrappedReturn<O, S> {
  const { cached = false, memo = false } = options;

  return (WrappedComponent: ComponentType<O & S>): FC<O> => {
    const EnhancedComponent: FC<O> = (props) => {
      const stateProps = cached
        ? useMemo(() => mapStateProps(props), [props])
        : mapStateProps(props);
      return <WrappedComponent {...props} {...stateProps} />;
    };

    EnhancedComponent.displayName = `withStateProps(${
      WrappedComponent.displayName || WrappedComponent.name || "Component"
    })`;

    return memo ? React.memo(EnhancedComponent) : EnhancedComponent;
  };
}
