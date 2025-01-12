import { Dispatch, SetStateAction, useRef, useState } from 'react';
import useLastCallback from '../events/useLastCallback';

export interface StateMediator<S = unknown> {
  (newState: unknown): S;
  (newState: unknown, dispatch: Dispatch<SetStateAction<S>>): void;
}
export type UseMediatedStateReturn<S = unknown> = [S, Dispatch<SetStateAction<S>>];

export function useMediatedState<S = undefined>(
  mediator: StateMediator<S | undefined>,
): UseMediatedStateReturn<S | undefined>;
export function useMediatedState<S = unknown>(
  mediator: StateMediator<S>,
  initialState: S,
): UseMediatedStateReturn<S>;
export function useMediatedState<S = unknown>(
  mediator: StateMediator<S>,
  initialState?: S,
): UseMediatedStateReturn<S> {
  const mediatorFn = useRef(mediator);

  const [state, setMediatedState] = useState<S>(initialState!);

  const setState = useLastCallback((newState: unknown) => {
    if (mediatorFn.current.length === 2) {
      mediatorFn.current(newState, setMediatedState);
    } else {
      setMediatedState(mediatorFn.current(newState));
    }
  });

  return [state, setState];
}
