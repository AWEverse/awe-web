import { Dispatch, SetStateAction, useState } from "react";
import useStableCallback from "./useStableCallback";
import useStateRef from "./useStateRef";

/**
 * A function type used as a mediator for state changes.
 * The mediator function can either directly return a new state value or accept a
 * dispatch function to update the state.
 *
 * @param newState - The new state value.
 * @param dispatch - The dispatch function to update the state.
 */
export interface StateMediator<S = unknown> {
  (newState: unknown): S; // Returns the new state
  (newState: unknown, dispatch: Dispatch<SetStateAction<S>>): void; // Directly sets the state via dispatch
}

/**
 * Return type for the `useMediatedState` hook. It provides the current state and
 * the function to set the state.
 *
 * @type {Array} [state, setState]
 * - state: The current value of the state.
 * - setState: A function that allows you to update the state.
 */
export type StateMediatorReturn<S = unknown> = [
  S, // The current state
  Dispatch<SetStateAction<S>>, // The function to update the state
];

/**
 * A custom hook that mediates the state updates through a provided mediator function.
 *
 * The hook supports two use cases:
 * 1. When no initial state is provided, the mediator function is used to derive the state.
 * 2. When an initial state is provided, the mediator function is used to update the state.
 *
 * The hook returns the current state and a function to update the state. When the state is
 * updated, the mediator function is invoked to process the new state.
 *
 * @param mediator - The mediator function that handles state updates.
 * @param initialState - (Optional) The initial state for the hook. If not provided, the state will be undefined initially.
 * @returns {StateMediatorReturn<S>} The current state and a function to set the new state.
 */
export default function <S = undefined>(
  mediator: StateMediator<S | undefined>,
): StateMediatorReturn<S | undefined>;
export default function <S = unknown>(
  mediator: StateMediator<S>,
  initialState: S,
): StateMediatorReturn<S>;
export default function <S = unknown>(
  mediator: StateMediator<S>,
  initialState?: S,
): StateMediatorReturn<S> {
  const mediatorFn = useStateRef(mediator);
  const [state, setMediatedState] = useState<S>(initialState!);

  const setState = useStableCallback((newState: unknown) => {
    if (mediatorFn.current.length === 2) {
      mediatorFn.current(newState, setMediatedState);
    } else {
      setMediatedState(mediatorFn.current(newState));
    }
  });

  return [state, setState];
}
