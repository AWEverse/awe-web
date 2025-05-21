import React from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";

/**
 * A Higher-Order Component (HOC) that wraps a component with an RTK Query hook
 * (query or mutation), passing the hook's state as props.
 * @param useHook - RTK Query hook (e.g., useQuery or useMutation).
 * @param mapArgs - Function to map component props to hook arguments or skipToken.
 * @returns A wrapped component with hook state merged into its props.
 */
export function withRTKHook<
  OwnProps extends object,
  StateProps extends object,
  Hook extends (arg: unknown) => StateProps,
>(
  useHook: Hook,
  mapArgs: (props: OwnProps) => Parameters<Hook>[0] | typeof skipToken,
  Component: React.ComponentType<OwnProps & StateProps>,
): React.FC<OwnProps> {
  const WrappedComponent = React.memo(function RTKWrapped(props: OwnProps) {
    const arg = mapArgs(props);
    const stateProps = useHook(arg);
    return <Component {...props} {...stateProps} />;
  });

  return WrappedComponent as unknown as React.FC<OwnProps>;
}
