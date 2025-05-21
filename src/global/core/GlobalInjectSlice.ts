import { Slice } from "@reduxjs/toolkit";
import { store } from "./GlobalStore";
import { SharedStore } from "./GlobalTypes";

/**
 * Type-safe accessor for the reducerManager attached to the store instance.
 */
function getReducerManager() {
  return (store as SharedStore<typeof store>).reducerManager;
}

/**
 * Injects a Redux slice reducer at runtime using the reducer manager.
 */
export function injectSlice(slice: Slice) {
  getReducerManager().add(slice.name, slice.reducer);
}
