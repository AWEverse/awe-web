import { Reducer, combineReducers } from "@reduxjs/toolkit";

export type ReducersMap<K extends string = string> = Record<K, Reducer>;

type ReducerChangeListener = () => void;

export const createReducerManager = <K extends string = string>(
  initialReducers: ReducersMap<K>,
) => {
  const reducers: ReducersMap<K> = { ...initialReducers };
  let combinedReducer = combineReducers(reducers);
  let listeners: ReducerChangeListener[] = [];

  return {
    getReducerMap: () => reducers,

    reduce: (state: any, action: any) => {
      return combinedReducer(state, action);
    },

    add: (key: K, reducer: Reducer) => {
      if (!key || reducers[key]) return;
      reducers[key] = reducer;
      combinedReducer = combineReducers(reducers);
      listeners.forEach((fn) => fn());
    },

    remove: (key: K) => {
      if (!key || !reducers[key]) return;
      delete reducers[key];
      combinedReducer = combineReducers(reducers);
      listeners.forEach((fn) => fn());
    },

    addListener: (fn: ReducerChangeListener) => {
      listeners.push(fn);
    },
    removeListener: (fn: ReducerChangeListener) => {
      listeners = listeners.filter((l) => l !== fn);
    },
  };
};

export type ReducerManager<K extends string = string> = ReturnType<
  typeof createReducerManager<K>
>;
