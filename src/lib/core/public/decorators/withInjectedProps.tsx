import React, { JSX } from "react";

export function injectProps<U extends Record<string, unknown>>(
  injectedProps: U,
) {
  return <T extends U & JSX.IntrinsicAttributes>(
    Component: React.ComponentType<T>,
  ): React.FC<Omit<T, keyof U>> => {
    const InjectedComponent: React.FC<Omit<T, keyof U>> = (props) => {
      const combinedProps = { ...props, ...injectedProps } as T;
      return <Component {...combinedProps} />;
    };

    InjectedComponent.displayName = `Injected(${Component.displayName || Component.name || "Component"})`;

    return InjectedComponent;
  };
}
