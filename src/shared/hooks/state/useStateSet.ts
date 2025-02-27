import { useState, useRef } from 'react';
import { useStableCallback, useStateRef } from '../base';

type InitialState<T> = Iterable<T> | (() => Iterable<T>);

export interface SetActions<T> {
  add: (item: T) => void;
  remove: (item: T) => void;
  clear: () => void;
  reset: () => void;
  toggle: (item: T) => void;
  has: (item: T) => boolean;
}

export interface StateSet<T> extends SetActions<T> {
  readonly values: readonly T[];
  readonly size: number;
}

function useStateSet<T>(initialState?: InitialState<T>): StateSet<T> {
  const initialSetRef = useRef<Set<T>>(new Set());

  const [stateSet, setStateSet] = useState<Set<T>>(() => {
    const initial = typeof initialState === 'function' ? initialState() : initialState;
    const initialSet = new Set(initial);
    initialSetRef.current = new Set(initialSet);
    return initialSet;
  });

  const stateSetRef = useStateRef(stateSet);

  const has = useStableCallback((item: T) => stateSetRef.current.has(item));

  const add = useStableCallback((item: T) => {
    setStateSet((prevSet) => {
      if (prevSet.has(item)) return prevSet;
      const nextSet = new Set(prevSet);
      nextSet.add(item);
      return nextSet;
    });
  });

  const remove = useStableCallback((item: T) => {
    setStateSet((prevSet) => {
      if (!prevSet.has(item)) return prevSet;
      const nextSet = new Set(prevSet);
      nextSet.delete(item);
      return nextSet;
    });
  });

  const clear = useStableCallback(() => {
    setStateSet(new Set());
  });

  const reset = useStableCallback(() => {
    setStateSet(new Set(initialSetRef.current));
  });

  const toggle = useStableCallback((item: T) => {
    setStateSet((prevSet) => {
      const nextSet = new Set(prevSet);
      nextSet.has(item) ? nextSet.delete(item) : nextSet.add(item);
      return nextSet;
    });
  });

  return {
    values: Array.from(stateSet),
    size: stateSet.size,
    has,
    add,
    remove,
    clear,
    reset,
    toggle,
  };
}

export default useStateSet;
