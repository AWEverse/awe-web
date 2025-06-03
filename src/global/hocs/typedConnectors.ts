import React from "react";
import type { ComponentType } from "react";
import { withGlobalState } from "./withGlobalState";
import type { WithGlobalStateOptions } from "./withGlobalState";
import { createMemoizedSelector } from "../core/selectors";
import type { RootState, AppDispatch } from "../core";

/**
 * Создает типизированный HOC с предустановленными селекторами
 */
export function createTypedHOC<
  StateProps extends object,
  DispatchProps extends object = {},
>(config: {
  /** Селектор для извлечения состояния */
  selector: (state: RootState) => StateProps;
  /** Фабрика для создания действий */
  actionsFactory?: (dispatch: AppDispatch) => DispatchProps;
  /** Опции для HOC */
  options?: WithGlobalStateOptions;
}) {
  return function <OwnProps extends object>(
    WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
  ) {
    if (config.actionsFactory) {
      return withGlobalState<OwnProps, StateProps, DispatchProps>(
        (state: RootState) => config.selector(state),
        (dispatch: AppDispatch, _ownProps: OwnProps) => config.actionsFactory!(dispatch),
        config.options,
      )(WrappedComponent);
    } else {
      return withGlobalState<OwnProps, StateProps, {}>(
        (state: RootState) => config.selector(state),
        () => ({}),
        config.options,
      )(WrappedComponent as any);
    }
  };
}

/**
 * Создает HOC для подключения конкретного среза состояния
 */
export function createSliceConnector<
  K extends keyof RootState,
  SelectedState = RootState[K],
>(
  stateKey: K,
  options?: WithGlobalStateOptions,
) {
  return function <OwnProps extends object>(
    WrappedComponent: ComponentType<OwnProps & { [P in K]: SelectedState }>,
  ) {
    return withGlobalState<OwnProps, { [P in K]: SelectedState }>(
      (state: RootState) => ({ [stateKey]: state[stateKey] } as { [P in K]: SelectedState }),
      options,
    )(WrappedComponent);
  };
}

/**
 * Создает HOC с композитными селекторами
 */
export function createCompositeConnector<
  StateProps extends object,
  DispatchProps extends object = {},
>(config: {
  /** Объект с именованными селекторами */
  selectors: {
    [K in keyof StateProps]: (state: RootState) => StateProps[K];
  };
  /** Фабрика действий */
  actionsFactory?: (dispatch: AppDispatch) => DispatchProps;
  /** Опции HOC */
  options?: WithGlobalStateOptions;
}) {
  const compositeSelector = createMemoizedSelector(
    Object.values(config.selectors) as Array<(state: RootState) => any>,
    (...values) => {
      const result = {} as StateProps;
      const keys = Object.keys(config.selectors) as Array<keyof StateProps>;
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      return result;
    },
  );
  return function <OwnProps extends object>(
    WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
  ) {
    return withGlobalState<OwnProps, StateProps, DispatchProps>(
      (state: RootState) => compositeSelector(state),
      config.actionsFactory
        ? (dispatch: AppDispatch, _ownProps: OwnProps) => config.actionsFactory!(dispatch)
        : () => ({} as DispatchProps),
      config.options,
    )(WrappedComponent);
  };
}

/**
 * Создает HOC с условной логикой
 */
export function createConditionalConnector<
  StateProps extends object,
  DispatchProps extends object = {},
>(config: {
  /** Условие для подключения состояния */
  condition: (state: RootState) => boolean;
  /** Селектор для активного состояния */
  activeSelector: (state: RootState) => StateProps;
  /** Селектор для неактивного состояния */
  inactiveSelector: (state: RootState) => StateProps;
  /** Фабрика действий */
  actionsFactory?: (dispatch: AppDispatch) => DispatchProps;
  /** Опции HOC */
  options?: WithGlobalStateOptions;
}) {
  return function <OwnProps extends object>(
    WrappedComponent: ComponentType<OwnProps & StateProps & DispatchProps>,
  ) {
    return withGlobalState<OwnProps, StateProps, DispatchProps>(
      (state: RootState) =>
        config.condition(state)
          ? config.activeSelector(state)
          : config.inactiveSelector(state),
      config.actionsFactory
        ? (dispatch: AppDispatch, _ownProps: OwnProps) => config.actionsFactory!(dispatch)
        : () => ({} as DispatchProps),
      config.options,
    )(WrappedComponent);
  };
}

/**
 * Утилита для создания действий с типизацией
 */
export function createTypedActions<T extends Record<string, any>>(
  actionsFactory: (dispatch: AppDispatch) => T,
): (dispatch: AppDispatch) => T {
  return actionsFactory;
}

/**
 * Утилита для создания селектора с типизацией
 /**
 * Миксин для добавления debug информации к HOC
 */
export function withDebugInfo<P extends object>(
  WrappedComponent: ComponentType<P>,
  debugName?: string,
): ComponentType<P> {
  const DebugComponent: ComponentType<P> = (props) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${debugName || WrappedComponent.name} props:`, props);
    }
    return React.createElement(WrappedComponent, props);
  };

  DebugComponent.displayName = `withDebugInfo(${debugName || WrappedComponent.displayName || WrappedComponent.name
    })`;

  return DebugComponent;
}
