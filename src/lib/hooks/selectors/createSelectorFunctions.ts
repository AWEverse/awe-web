/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StoreApi, type UseBoundStore } from 'zustand';
import { createSelectorFunction } from './utils';

export interface FSelectors<T> {
  use: {
    [key in keyof T]: () => T[key];
  };
}

export function createSelectorFunctions<T extends object>(store: UseBoundStore<StoreApi<T>> | StoreApi<T>) {
  const storeIn = store as any;

  storeIn.use = {};

  Object.keys(storeIn.getState()).forEach(key => {
    storeIn.use[key] = createSelectorFunction(storeIn, (state: T) => state[key as keyof T]);
  });

  return store as UseBoundStore<StoreApi<T>> & FSelectors<T>;
}
