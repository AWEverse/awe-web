import { ReducerManager } from "./GlobalReducerManager";

export type SharedStore<S> = S & {
  reducerManager: ReducerManager;
};
