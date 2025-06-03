import { Reducer, combineReducers } from "@reduxjs/toolkit";

export type ReducersMap = {
  [key: string]: Reducer;
};

type ReducerChangeListener = () => void;

export interface ReducerManager {
  getReducerMap: () => ReducersMap;
  reduce: (state: any, action: any) => any;
  add: (key: string, reducer: Reducer) => void;
  remove: (key: string) => void;
  addListener: (fn: ReducerChangeListener) => void;
  removeListener: (fn: ReducerChangeListener) => void;
  has: (key: string) => boolean;
  clear: () => void;
  getKeys: () => string[];
}

/**
 * Typed reducer manager with support for dynamic reducer injection
 */
export function createReducerManager(
  initialReducers: ReducersMap
): ReducerManager {
  let reducers = { ...initialReducers };
  let listeners: ReducerChangeListener[] = [];
  let combinedReducer = combineReducers(reducers);

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  const updateCombinedReducer = () => {
    const hasReducers = Object.keys(reducers).length > 0;
    combinedReducer = hasReducers
      ? combineReducers(reducers)
      : (state = {}) => state; // Fallback when no reducers
  };

  const reduce: Reducer = (state, action) => {
    return combinedReducer(state, action);
  };

  return {
    getReducerMap: () => ({ ...reducers }), // Return copy for immutability

    reduce,

    add: (key: string, reducer: Reducer) => {
      if (!key || typeof key !== 'string') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('ReducerManager.add: key must be a non-empty string');
        }
        return;
      }

      if (reducers[key]) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ReducerManager.add: reducer with key "${key}" already exists`);
        }
        return;
      }

      if (typeof reducer !== 'function') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('ReducerManager.add: reducer must be a function');
        }
        return;
      }

      reducers[key] = reducer;
      updateCombinedReducer();
      notifyListeners();

      if (process.env.NODE_ENV === 'development') {
        console.log(`ReducerManager: Added reducer "${key}"`);
      }
    },

    remove: (key: string) => {
      if (!key || typeof key !== 'string') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('ReducerManager.remove: key must be a non-empty string');
        }
        return;
      }

      if (!reducers[key]) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ReducerManager.remove: reducer with key "${key}" does not exist`);
        }
        return;
      }

      delete reducers[key];
      updateCombinedReducer();
      notifyListeners();

      if (process.env.NODE_ENV === 'development') {
        console.log(`ReducerManager: Removed reducer "${key}"`);
      }
    },

    has: (key: string) => {
      return key in reducers;
    },

    clear: () => {
      const keys = Object.keys(reducers);
      if (keys.length === 0) return;

      reducers = {};
      updateCombinedReducer();
      notifyListeners();
    },

    getKeys: () => {
      return Object.keys(reducers);
    },

    addListener: (fn: ReducerChangeListener) => {
      if (typeof fn !== 'function') {
        console.warn('ReducerManager.addListener: listener must be a function');
        return;
      }
      listeners.push(fn);
    },

    removeListener: (fn: ReducerChangeListener) => {
      listeners = listeners.filter((l) => l !== fn);
    },
  };
}
