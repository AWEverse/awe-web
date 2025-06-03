import { configureStore } from "@reduxjs/toolkit";
import { createReducerManager } from "./GlobalReducerManager";
import { SharedStore } from "./GlobalTypes";
import { DEBUG } from "@/lib/config/dev";
import authReducer from "../reducers/authReducer";
import playerReducer from "../reducers/playerReducer";

/**
 * Base reducers that are always present in the store
 */
const baseReducers = {
  auth: authReducer,
  player: playerReducer,
} as const;

/**
 * Create the reducer manager for dynamic reducer injection
 */
export const reducerManager = createReducerManager(baseReducers);

/**
 * Configure the Redux store with middleware and dev tools
 */
export const store = configureStore({
  reducer: reducerManager.reduce,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        // Ignore specific paths that may contain non-serializable values
        ignoredPaths: ['register', 'rehydrate'],
      },
    }),
  devTools: DEBUG && {
    name: 'AWE Global Store',
    trace: true,
    traceLimit: 25,
  },
});

/**
 * Attach the reducer manager to the store for dynamic reducer support
 */
(store as SharedStore<typeof store>).reducerManager = reducerManager;

/**
 * Hot Module Replacement support for development
 */
if (DEBUG && import.meta?.hot) {
  import.meta.hot.accept(['./GlobalReducerManager'], () => {
    store.replaceReducer(reducerManager.reduce);
  });
}

/**
 * Type definitions
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Type helpers for working with state slices
 */
export type BaseState = {
  [K in keyof typeof baseReducers]: ReturnType<typeof baseReducers[K]>;
};

/**
 * Type guard to check if a state slice exists
 */
export function hasStateSlice<K extends string>(
  state: RootState,
  key: K,
): state is RootState & Record<K, any> {
  return key in state && state[key] !== undefined;
}

/**
 * Helper to get a typed base state slice
 */
export function getBaseStateSlice<K extends keyof BaseState>(
  state: RootState,
  key: K,
): BaseState[K] {
  return state[key];
}

/**
 * Helper to safely get a dynamic state slice
 */
export function getDynamicStateSlice<T = any>(
  state: RootState,
  key: string,
): T | undefined {
  return hasStateSlice(state, key) ? state[key] : undefined;
}
