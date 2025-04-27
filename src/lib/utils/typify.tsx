import React, { JSX, useSyncExternalStore } from "react";

type ActionType<A, S> = {
  [K in keyof A]: A[K] extends (state: S, ...args: infer P) => S
    ? (...args: P) => void
    : never;
};

export function createStateManager<
  State,
  Actions extends Record<string, any>,
>() {
  let state: State;
  const listeners = new Set<NoneToVoidFunction>();

  const subscribe = (listener: NoneToVoidFunction) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getState = () => state;

  const setState = (next: State | ((prev: State) => State)) => {
    const nextState = typeof next === "function" ? (next as any)(state) : next;

    if (nextState !== state) {
      state = nextState;
      listeners.forEach((l) => l());
    }
  };

  const actions = {} as ActionType<Actions, State>;

  const registerActions = (defs: {
    [K in keyof Actions]: (state: State, ...args: any[]) => State;
  }) => {
    (Object.keys(defs) as (keyof Actions)[]).forEach((key) => {
      actions[key] = ((...args: any[]) => {
        setState((prev) => defs[key](prev, ...args));
      }) as any;
    });
    return actions;
  };

  function useStore<Selected>(
    selector: (state: State) => Selected = (s) => s as any,
  ): [Selected, typeof actions] {
    const selected = useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    );
    return [selected, actions];
  }

  const init = (initial: State) => {
    state = initial;
    listeners.forEach((l) => l());
  };

  return {
    getState,
    setState,
    registerActions,
    useStore,
    init,
  };
}

/**
 * HOC to provide initial state to a component using the state manager.
 * Usage:
 *   export default withGlobalState(MyComponent, manager, initialState)
 */
export function withGlobalState<S, P extends JSX.IntrinsicAttributes = {}>(
  Component: React.ComponentType<P>,
  manager: ReturnType<typeof createStateManager<S, any>>,
  initialState: S,
) {
  return function WrappedComponent(props: P) {
    React.useMemo(() => {
      manager.init(initialState);
      // eslint-disable-next-line
    }, []);
    return <Component {...props} />;
  };
}
