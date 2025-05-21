import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../core";
import type { FC, ComponentType } from "react";

export function withGlobalState<
  OwnProps extends object,
  StateProps extends object = {},
  DispatchProps extends object = {},
>(
  mapStateToProps: (state: RootState, ownProps: OwnProps) => StateProps,
  mapDispatchToProps?: (
    dispatch: AppDispatch,
    ownProps: OwnProps,
  ) => DispatchProps,
) {
  return function wrapComponent(
    WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
  ): FC<OwnProps> {
    return function WithStateAndDispatchComponent(props: OwnProps) {
      const stateProps = useSelector((state: RootState) =>
        mapStateToProps(state, props),
      );
      const dispatch = useDispatch<AppDispatch>();
      const dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(dispatch, props)
        : ({} as DispatchProps);

      return <WrappedComponent {...props} {...stateProps} {...dispatchProps} />;
    };
  };
}
