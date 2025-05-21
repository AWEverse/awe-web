import { configureStore } from "@reduxjs/toolkit";
import { createReducerManager } from "./GlobalReducerManager";
import { SharedStore } from "./GlobalTypes";
import dummyReducer from "./dummyReducer";
import { DEBUG } from "@/lib/config/dev";

/**
 * The base reducers for the Redux store. Extend this object to add static reducers.
 * Dynamic reducers can be injected at runtime.
 */
const baseReducers = {
  dummy: dummyReducer,
};

// Use string as the key type for dynamic/static reducers
export const reducerManager = createReducerManager<string>(baseReducers);

/**
 * The Redux store instance, configured with dynamic reducer management.
 */
export const store = configureStore({
  reducer: reducerManager.reduce,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // + RTK Query, etc.
  devTools: process.env.NODE_ENV !== "production",
});

/**
 * Attach the reducerManager to the store instance for dynamic reducer support.
 * This uses a type assertion to extend the store object.
 */
(store as SharedStore<typeof store>).reducerManager = reducerManager;

if (DEBUG) {
  /**
 * Hot Module Replacement (HMR) for reducers in development.
 */
  if (import.meta && import.meta.hot) {
    import.meta.hot.accept(["./GlobalReducerManager", "./dummyReducer"], () => {
      store.replaceReducer(reducerManager.reduce);
    });
  }
}

/**
 * RootState is the type of the entire Redux state tree.
 */
export type RootState = ReturnType<typeof store.getState>;
/**
 * AppDispatch is the type of the Redux store's dispatch function.
 */
export type AppDispatch = typeof store.dispatch;
