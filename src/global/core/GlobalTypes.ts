import { ReducerManager } from "./GlobalReducerManager";

/**
 * Base state interface that all Redux slices should extend
 */
export interface BaseState {
  readonly loading?: boolean;
  readonly error?: string | null;
}

export type SharedStore<S> = S & {
  reducerManager: ReducerManager;
};
