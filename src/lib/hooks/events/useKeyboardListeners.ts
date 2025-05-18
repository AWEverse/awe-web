import captureKeyboardListeners, { CaptureOptions, LegacyCaptureOptions } from "@/lib/utils/captureKeyboardListeners";
import { useEffect } from "react";

/**
 * useKeyboardListeners attaches keyboard event handlers defined in the options
 * when the component mounts and cleans them up on unmount.
 *
 * @param options - An object where keys are handler names (e.g., "onEnter") and values are handler functions.
 * @param isActive - A boolean to enable or disable the listeners (defaults to true).
 */
export default function useKeyboardListeners(
  options: CaptureOptions | LegacyCaptureOptions,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;
    const releaseListeners = captureKeyboardListeners(options);
    return () => releaseListeners();
  }, [options, isActive]);
}
