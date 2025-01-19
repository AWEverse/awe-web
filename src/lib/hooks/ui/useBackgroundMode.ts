import { createCallbackManager } from "@/lib/utils/callbacks";
import { useEffect } from "react";
import { useStableCallback } from "@/shared/hooks/base";

const blurCallbacks = createCallbackManager();
const focusCallbacks = createCallbackManager();

let isFocused = document.hasFocus();

window.addEventListener("blur", () => {
  if (!isFocused) {
    return;
  }

  isFocused = false;
  blurCallbacks.runCallbacks();
});

window.addEventListener("focus", () => {
  isFocused = true;
  focusCallbacks.runCallbacks();
});

export default function useBackgroundMode(
  onBlur?: AnyToVoidFunction,
  onFocus?: AnyToVoidFunction,
  isDisabled = false,
) {
  const handleBlur = useStableCallback(onBlur);
  const handleFocus = useStableCallback(onFocus);

  useEffect(() => {
    if (isDisabled) {
      return undefined;
    }

    if (!isFocused) {
      handleBlur();
    }

    blurCallbacks.addCallback(handleBlur);
    focusCallbacks.addCallback(handleFocus);

    return () => {
      focusCallbacks.removeCallback(handleFocus);
      blurCallbacks.removeCallback(handleBlur);
    };
  }, [isDisabled, handleBlur, handleFocus]);
}

export function isBackgroundModeActive() {
  return !isFocused;
}
