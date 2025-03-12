import pako from "pako";
import Store from "../lib/Store";
import initialState from "./initialState";
import reducer from "./reducer";
import { SafeIdbStorage } from "@/lib/core";
import { Action, AnimationState } from "./types";

const CACHE_KEY = "animationsStoreState";

let animationsStore: Store<AnimationState, Action>;

async function loadStateFromCache(): Promise<typeof initialState | null> {
  try {
    const zippedState = await SafeIdbStorage.get(CACHE_KEY);
    if (!zippedState) return null;

    const decompressed = pako.inflate(zippedState, { to: "string" });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Failed to load state from cache:", error);
    return null;
  }
}

async function saveStateToCache(state: typeof initialState): Promise<void> {
  try {
    const stateString = JSON.stringify(state);
    const compressed = pako.deflate(stateString);
    await SafeIdbStorage.set(CACHE_KEY, compressed);
  } catch (error) {
    console.error("Failed to save state to cache:", error);
  }
}

export default async function initAnimationsStore() {
  if (!animationsStore) {
    const cachedState = await loadStateFromCache();
    animationsStore = new Store(cachedState || initialState, reducer);

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    animationsStore.subscribe(
      (state) => state,
      (newState) => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
          saveStateToCache(newState);
        }, 5000); // Save after 1 second of inactivity
      },
    );
  }
}

export function getAnimationsStore() {
  return animationsStore;
}
