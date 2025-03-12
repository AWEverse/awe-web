import { useStableCallback } from "@/shared/hooks/base";
import { useComponentDidMount } from "@/shared/hooks/effects/useLifecycle";
import { FC, useState, useRef } from "react";

export interface ActionOptions {
  forceOnHeavyAnimation?: boolean;
  forceSyncOnIOs?: boolean;
  forceOutdated?: boolean;
}
export type StickToFirstFn = () => void;

export function typify<ProjectGlobalState, ActionPayloads>() {
  type ActionFunction<P> = undefined extends P
    ? (payload?: P, options?: ActionOptions) => void
    : (payload: P, options?: ActionOptions) => void;

  type ProjectActions = {
    [K in keyof ActionPayloads]: ActionFunction<ActionPayloads[K]>;
  };

  type ActionHandlers = {
    [K in keyof ActionPayloads]: (
      global: ProjectGlobalState,
      actions: ProjectActions,
      payload: ActionPayloads[K],
    ) => ProjectGlobalState | void | Promise<void>;
  };

  let globalState: ProjectGlobalState;
  const handlers: Partial<ActionHandlers> = {};
  const subscribers: Array<(state: ProjectGlobalState) => void> = [];

  const notifySubscribers = () => {
    subscribers.forEach((subscriber) => subscriber(globalState));
  };

  const getGlobal = <T extends ProjectGlobalState>(): T => {
    return globalState as T; // [[5]]
  };

  const setGlobal = (state: ProjectGlobalState) => {
    globalState = state;
    notifySubscribers();
  };

  const getActions = (): ProjectActions => {
    const actions = {} as ProjectActions;
    for (const key in handlers) {
      const actionName = key as keyof ActionPayloads;

      actions[actionName] = ((
        payload: ActionPayloads[keyof ActionPayloads],
      ) => {
        const handler = handlers[actionName];

        if (handler) {
          const result = handler(
            globalState,
            actions,
            payload as ActionPayloads[typeof actionName],
          );

          if (result instanceof Promise) {
            result.then((asyncResult) => {
              if (asyncResult !== undefined) {
                globalState = asyncResult;
                notifySubscribers();
              }
            });
          } else if (result) {
            globalState = result;
            notifySubscribers();
          }
        }
      }) as ActionFunction<ActionPayloads[typeof actionName]>; // [[2]][[3]]
    }
    return actions;
  };

  const addActionHandler = <K extends keyof ActionPayloads>(
    name: K,
    handler: ActionHandlers[K],
  ) => {
    handlers[name] = handler;
  };

  const withStateProps = <OwnProps extends AnyLiteral>(
    mapStateToProps: (
      global: ProjectGlobalState,
      ownProps: OwnProps,
    ) => AnyLiteral,
    activationFn?: (
      global: ProjectGlobalState,
      ownProps: OwnProps,
      stickToFirst: StickToFirstFn,
    ) => boolean,
  ) => {
    return (Component: FC<any>): FC<OwnProps> =>
      (props: OwnProps) => {
        const [state, setState] = useState(globalState);

        const subscriberRef = useRef<
          ((state: ProjectGlobalState) => void) | null
        >(null);

        const stickToFirst = useStableCallback(() => {
          const subscriber = subscriberRef.current;
          if (subscriber) {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) subscribers.splice(index, 1);
            subscriberRef.current = null;
          }
        });

        useComponentDidMount(() => {
          const subscriber = (newState: ProjectGlobalState) =>
            setState(newState);
          subscriberRef.current = subscriber; // Store in ref [[10]]
          subscribers.push(subscriber);

          return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) subscribers.splice(index, 1);
          };
        });

        const mappedProps = mapStateToProps(state, props);
        const shouldActivate = activationFn
          ? activationFn(state, props, stickToFirst) // Now accessible [[8]]
          : true;

        return shouldActivate ? (
          <Component {...props} {...mappedProps} />
        ) : null;
      };
  };

  return {
    getGlobal,
    setGlobal,
    getActions,
    addActionHandler,
    withStateProps,
  };
}
