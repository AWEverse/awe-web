import { SmartDebouncer, StorageManager } from "@/lib/core";
import Store from "../lib/Store";
import initialState from "./initialState";
import reducer from "./reducer";
import { Action, AnimationState } from "./types";

const CACHE_KEY = "animationsStoreState";
const SAVE_DEBOUNCE_MS = 3000;

let animationsStore: Store<AnimationState, Action>;

/**
 * Validate the loaded state to ensure it matches the expected shape
 */
function validateState(state: unknown): state is AnimationState {
  return typeof state === "object" && state !== null;
}

/**
 * Initialize the animations store with optimized caching and error handling
 */
export default async function initAnimationsStore(): Promise<void> {
  if (animationsStore) return;

  let cachedState: AnimationState | undefined;
  try {
    const loadedState = await StorageManager.load<AnimationState>(CACHE_KEY);
    if (validateState(loadedState)) {
      cachedState = loadedState;
    } else {
      console.warn("Invalid cached state detected, falling back to initial state");
    }
  } catch (error) {
    console.error("Failed to load cached state:", error);
  }

  animationsStore = new Store(cachedState || initialState, reducer);

  const saveDebouncer = new SmartDebouncer<AnimationState>(
    async (state) => {
      try {
        await StorageManager.save(CACHE_KEY, state);
      } catch (error) {
        console.error("Failed to save state:", error);
      }
    },
    SAVE_DEBOUNCE_MS
  );

  animationsStore.subscribe(
    (state) => state,
    (newState) => {
      saveDebouncer.schedule(newState);
    }
  );

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      saveDebouncer.flush();
    });
  }
}

/**
 * Get the singleton store instance
 */
export function getAnimationsStore(): Store<AnimationState, Action> {
  if (!animationsStore) {
    throw new Error("Animation store accessed before initialization");
  }
  return animationsStore;
}

/**
 * Force save the current state immediately
 */
export async function forceStateSave(): Promise<boolean> {
  if (!animationsStore) return false;
  try {
    await StorageManager.save(CACHE_KEY, animationsStore.getState());
    return true;
  } catch (error) {
    console.error("Failed to force save state:", error);
    return false;
  }
}

/**
 * Clear animation state cache
 */
export async function clearAnimationCache(): Promise<void> {
  try {
    await StorageManager.clear(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

/**
 * Reset the store to its initial state and clear the cache
 */
export async function resetAnimationStore(): Promise<void> {
  try {
    await clearAnimationCache();
    animationsStore = new Store(initialState, reducer);
  } catch (error) {
    console.error("Failed to reset store:", error);
  }
}
