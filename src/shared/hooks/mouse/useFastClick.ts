import { useMemo } from "react";
import { useStableCallback } from "../base";
import { debounce, throttle } from "@/lib/core"; // Assuming you have debounce and throttle utilities
import { EMouseButton, IS_TOUCH_ENV } from "@/lib/core";

type EventArg<E> = React.MouseEvent<E>;
type EventHandler<E> = (e: EventArg<E>) => void;

interface UseFastClickOptions<T> {
  /** Callback function to be invoked on a valid click or mouse down event. */
  callback?: EventHandler<T>;

  /** Debounce interval in milliseconds. Debounces the click if provided. */
  debounceMs?: number;

  /** Throttle interval in milliseconds. Throttles the click if provided. */
  throttleMs?: number;

  /** Disables the click event handler if set to `true`. */
  disabled?: boolean;
}

/**
 * useFastClick is a hook that provides an optimized click handler with options for debouncing, throttling,
 * and conditional disabling. It also adapts based on whether the environment is touch-enabled or mouse-enabled.
 *
 * @template T - The type of the HTML element (e.g., `HTMLDivElement`, `HTMLButtonElement`).
 *
 * @param {UseFastClickOptions<T>} options - Configuration options for the hook.
 *   - `callback`: The callback to invoke on click.
 *   - `debounceMs`: Optional debounce interval in milliseconds.
 *   - `throttleMs`: Optional throttle interval in milliseconds.
 *   - `disabled`: Boolean flag to disable the click handler.
 *
 * @returns {object} - Returns an object containing the appropriate event handler for the current environment.
 *   - If `IS_TOUCH_ENV` is true (i.e., a touch device), returns `{ handleClick }`.
 *   - Otherwise, returns `{ handleMouseDown }`.
 *
 * @example
 * const { handleClick } = useFastClick({
 *   callback: (e) => console.log('Clicked!', e),
 *   debounceMs: 200,
 *   disabled: false
 * });
 *
 * <button onClick={handleClick}>Click Me</button>
 */
export function useFastClick<T extends HTMLDivElement | HTMLButtonElement>(
  options: UseFastClickOptions<T> = {},
): object {
  const { callback, debounceMs, throttleMs, disabled = false } = options;

  const handler = useStableCallback((e: EventArg<T>) => {
    if (disabled) {
      return;
    }

    if (e.type === "mousedown" && e.button !== EMouseButton.Main) {
      return;
    }

    callback?.(e);
  });

  const memoizedHandler = useMemo(() => {
    if (debounceMs) {
      return debounce(handler, debounceMs);
    }

    if (throttleMs) {
      return throttle(handler, throttleMs);
    }

    return handler;
  }, [handler, debounceMs, throttleMs]);

  return IS_TOUCH_ENV
    ? { handleClick: callback && !disabled ? memoizedHandler : undefined } // For touch environments
    : { handleMouseDown: callback && !disabled ? memoizedHandler : undefined }; // For mouse environments
}
