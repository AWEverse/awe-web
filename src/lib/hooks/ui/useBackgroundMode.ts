import { createCallbackManager } from "@/lib/utils/callbacks";
import { useStableCallback } from "@/shared/hooks/base";
import { useEffect } from "react";

const blurCallbacks = createCallbackManager<NoneToVoidFunction>();
const focusCallbacks = createCallbackManager<NoneToVoidFunction>();

let isFocused = typeof document !== "undefined" && document.hasFocus();

const handleWindowBlur = () => {
  if (!isFocused) return;
  isFocused = false;
  blurCallbacks.runCallbacks();
};

const handleWindowFocus = () => {
  if (isFocused) return;
  isFocused = true;
  focusCallbacks.runCallbacks();
};

if (typeof window !== "undefined") {
  window.removeEventListener("blur", handleWindowBlur);
  window.removeEventListener("focus", handleWindowFocus);

  window.addEventListener("blur", handleWindowBlur, { passive: true });
  window.addEventListener("focus", handleWindowFocus, { passive: true });
}

/**
 * Хук для отслеживания ухода страницы в фоновый режим и возвращения фокуса.
 * @param onBlur Функция, вызываемая при потере фокуса.
 * @param onFocus Функция, вызываемая при возврате фокуса.
 * @param isDisabled Флаг для отключения отслеживания.
 */
export default function useBackgroundMode(
  onBlur?: NoneToVoidFunction,
  onFocus?: NoneToVoidFunction,
  isDisabled: boolean = false,
) {
  const lastOnBlur = useStableCallback(onBlur);
  const lastOnFocus = useStableCallback(onFocus);

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    if (!isFocused) {
      lastOnBlur();
    }

    const removeblurCallbacks = blurCallbacks.addCallback(lastOnBlur);
    const removefocusCallbacks = focusCallbacks.addCallback(lastOnFocus);

    return () => {
      removeblurCallbacks();
      removefocusCallbacks();
    };
  }, [isDisabled, lastOnBlur, lastOnFocus]);
}

/**
 * Функция для проверки, находится ли страница в фоновом режиме.
 * @returns true, если страница НЕ в фокусе, иначе false.
 */
export function isBackgroundModeActive(): boolean {
  return !isFocused;
}
