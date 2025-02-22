import captureKeyboardListeners, { CaptureOptions } from "@/lib/utils/captureKeyboardListeners";
import { useEffect } from "react";

/**
 * useKeyboardListeners attaches keyboard event handlers defined in the CaptureOptions
 * when the component mounts and cleans them up on unmount.
 *
 * @param options - An object where keys are handler names (e.g. "onEnter") and values are the handler functions.
 */
export default function useKeyboardListeners(options: CaptureOptions) {
  useEffect(() => {
    const releaseListeners = captureKeyboardListeners(options);

    return () => {
      releaseListeners();
    };
  }, [options]);
}
