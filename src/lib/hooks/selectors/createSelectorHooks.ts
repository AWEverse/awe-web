/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StoreApi, type UseBoundStore } from 'zustand';
import { createSelectorFunction } from './utils';

export type HSelectors<T> = {
  [Key in keyof T as string & Key]: () => T[Key];
};

export function createSelectorHooks<T extends object>(store: UseBoundStore<StoreApi<T>> | StoreApi<T>) {
  const storeIn = store as any;

  Object.keys(storeIn.getState()).forEach(key => {
    storeIn[key] = createSelectorFunction(storeIn, (state: T) => state[key as keyof T]);
  });

  return storeIn as UseBoundStore<StoreApi<T>> & HSelectors<T>;
}
