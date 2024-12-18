/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseBoundStore, StoreApi, useStore } from 'zustand';

type TStore<StateType> = UseBoundStore<StoreApi<StateType>> | StoreApi<StateType>;

export function createSelectorFunction<StateType>(storeIn: TStore<StateType>, selector: (state: StateType) => any) {
  if (typeof storeIn === 'function') {
    return () => storeIn(selector);
  }

  return () => useStore(storeIn, selector as any);
}
