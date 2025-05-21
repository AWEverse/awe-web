import { useEffect } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { createCallbackManager } from "@/lib/utils/callbacks";

const backgroundCallbacks = createCallbackManager();
const foregroundCallbacks = createCallbackManager();

// SSR-safe state tracking
let isFocused = false;
let isVisible = true;
let isBackground = false;

if (typeof document !== "undefined") {
  isFocused = document.hasFocus();
  isVisible = document.visibilityState === "visible";
  isBackground = !isFocused || !isVisible;
}

const updateBackgroundState = () => {
  const prevIsBackground = isBackground;

  isFocused = document.hasFocus();
  isVisible = document.visibilityState === "visible";
  isBackground = !isFocused || !isVisible;

  if (prevIsBackground !== isBackground) {
    if (isBackground) {
      backgroundCallbacks.runCallbacks();
    } else {
      foregroundCallbacks.runCallbacks();
    }
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("blur", updateBackgroundState, { passive: true });
  window.addEventListener("focus", updateBackgroundState, { passive: true });
  document.addEventListener("visibilitychange", updateBackgroundState, {
    passive: true,
  });
}

/**
 * useBackgroundMode
 * @param onForeground - called when app becomes active (foreground)
 * @param onBackground - called when app becomes inactive (background)
 * @param isDisabled - disables the effect if true
 * @param mode - 'focus' | 'visibility' | 'both'
 */
export default function useBackgroundMode(
  onForeground?: () => void,
  onBackground?: () => void,
  isDisabled: boolean = false,
  mode: "focus" | "visibility" | "both" = "both",
) {
  const stableOnBackground = useStableCallback(onBackground);
  const stableOnForeground = useStableCallback(onForeground);

  useEffect(() => {
    if (isDisabled) return;

    if (isBackgroundModeActive(mode)) {
      stableOnBackground?.();
    }

    const removeBackground = backgroundCallbacks.addCallback(() => {
      if (isBackgroundModeActive(mode)) stableOnBackground?.();
    });

    const removeForeground = foregroundCallbacks.addCallback(() => {
      if (!isBackgroundModeActive(mode)) stableOnForeground?.();
    });

    return () => {
      removeBackground();
      removeForeground();
    };
  }, [isDisabled, stableOnBackground, stableOnForeground, mode]);
}

/**
 * Returns whether the current mode is considered background
 * @param mode - 'focus' | 'visibility' | 'both'
 */
export function isBackgroundModeActive(
  mode: "focus" | "visibility" | "both" = "both",
): boolean {
  !isVisible;

  switch (mode) {
    case "focus":
      return !isFocused;
    case "visibility":
      return !isVisible;
    case "both":
      return !isFocused || !isVisible;
    default:
      return false;
  }
}
