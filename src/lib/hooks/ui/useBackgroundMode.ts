import { useEffect } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { createCallbackManager } from "@/lib/utils/callbacks";

const backgroundCallbacks = createCallbackManager();
const foregroundCallbacks = createCallbackManager();

let isFocused = typeof document !== "undefined" && document.hasFocus();
let isVisible =
  typeof document !== "undefined" && document.visibilityState === "visible";
let isBackground = !isVisible || !isFocused;

const updateBackgroundState = () => {
  const wasBackground = isBackground;

  isFocused = document.hasFocus();
  isVisible = document.visibilityState === "visible";
  isBackground = !isVisible || !isFocused;

  if (wasBackground && !isBackground) {
    foregroundCallbacks.runCallbacks();
  } else if (!wasBackground && isBackground) {
    backgroundCallbacks.runCallbacks();
  }
};

const handleWindowBlur = () => updateBackgroundState();
const handleWindowFocus = () => updateBackgroundState();
const handleVisibilityChange = () => updateBackgroundState();

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.removeEventListener("blur", handleWindowBlur);
  window.removeEventListener("focus", handleWindowFocus);
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  window.addEventListener("blur", handleWindowBlur, { passive: true });
  window.addEventListener("focus", handleWindowFocus, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange, {
    passive: true,
  });
}

export default function useBackgroundMode(
  onForeground?: NoneToVoidFunction,
  onBackground?: NoneToVoidFunction,
  isDisabled: boolean = false,
  mode = "both",
) {
  const lastOnBackground = useStableCallback(onBackground);
  const lastOnForeground = useStableCallback(onForeground);

  useEffect(() => {
    if (isDisabled) return;

    const getIsBackground = () => {
      if (mode === "focus") return !isFocused;
      if (mode === "visibility") return !isVisible;
      return !isVisible || !isFocused;
    };

    const currentIsBackground = getIsBackground();
    if (currentIsBackground) {
      lastOnBackground?.();
    }

    const wrappedOnBackground = () => {
      if (getIsBackground()) {
        lastOnBackground?.();
      }
    };
    const wrappedOnForeground = () => {
      if (!getIsBackground()) {
        lastOnForeground?.();
      }
    };

    const removeBackground =
      backgroundCallbacks.addCallback(wrappedOnBackground);
    const removeForeground =
      foregroundCallbacks.addCallback(wrappedOnForeground);

    return () => {
      removeBackground();
      removeForeground();
    };
  }, [isDisabled, lastOnBackground, lastOnForeground, mode]);
}

export function isBackgroundModeActive(mode = "both") {
  if (mode === "focus") return !isFocused;
  if (mode === "visibility") return !isVisible;
  return !isVisible || !isFocused;
}
