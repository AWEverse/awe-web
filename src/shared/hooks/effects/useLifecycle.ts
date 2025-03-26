import { DEBUG } from "@/lib/config/dev";
import { EffectCallback, useEffect } from "react";

type CleanupFn = () => void | Promise<void>;
type EffectFn = () => void | Promise<void> | CleanupFn;

const EMPTY_DEPS = [] as const;

/**
 * Executes an effect once when the component mounts, similar to componentDidMount,
 * with optional cleanup on unmount, similar to componentWillUnmount.
 * Supports both synchronous and asynchronous operations with proper error handling.
 *
 * @param effect - Effect callback to run on mount (can return a cleanup function)
 * @param onError - Optional error handler for effect and cleanup failures
 *
 * @example
 * useMountEffectAsync(() => {
 *   const controller = new AbortController();
 *   fetchData(controller.signal);
 *   return () => controller.abort();
 * }, (error) => console.error(error));
 */
export function useMountEffectAsync(
  effect: EffectFn,
  onError?: (error: unknown) => void,
) {
  useEffect(() => {
    let mounted = true;
    let cleanup: CleanupFn | undefined;

    const executeEffect = async () => {
      try {
        const result = await effect();

        if (mounted && typeof result === "function") {
          cleanup = result;
        }
      } catch (error) {
        if (mounted) {
          onError?.(error) ??
            (DEBUG && console.error("Mount effect error:", error));
        }
      }
    };

    executeEffect();

    return () => {
      mounted = false;

      if (cleanup) {
        const executeCleanup = async () => {
          try {
            await cleanup?.();
          } catch (error) {
            onError?.(error) ??
              (DEBUG && console.error("Cleanup error:", error));
          }
        };
        void executeCleanup();
      }
    };
  }, EMPTY_DEPS);
}

/**
 * Runs a one-time effect when the component mounts (similar to componentDidMount).
 *
 * @param effect - The effect callback to execute on mount
 */
export function useComponentDidMount(effect: EffectCallback) {
  useEffect(() => {
    effect();
  }, EMPTY_DEPS);
}

/**
 * Runs a cleanup effect when the component unmounts (similar to componentWillUnmount).
 *
 * @param cleanupEffect - The cleanup callback to execute on unmount
 */
export function useComponentWillUnmount(cleanupEffect: () => void) {
  useEffect(() => {
    return cleanupEffect;
  }, EMPTY_DEPS);
}
