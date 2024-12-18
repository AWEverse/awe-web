import { ComponentType, FC } from 'react';

type WrappedReturn<O extends object, S extends object> = (WrappedComponent: ComponentType<O & S>) => FC<O>;

type PropsCallback<O extends object, S extends object> = (props: O) => S;

/**
 * This function creates a higher-order component that maps state properties to props.
 * @param mapStateProps - A function that maps incoming props to state properties.
 * @returns A higher-order component that enhances the input component with state properties.
 */
export default function withStateProps<O extends object, S extends object>(
  mapStateProps: PropsCallback<O, S>,
): WrappedReturn<O, S> {
  return (WrappedComponent: ComponentType<O & S>): FC<O> => {
    const EnhancedComponent: FC<O> = props => {
      const stateProps = mapStateProps(props);
      return <WrappedComponent {...props} {...stateProps} />;
    };

    EnhancedComponent.displayName = `withStateProps(${WrappedComponent.displayName || WrappedComponent.name})`;

    return EnhancedComponent;
  };
}
