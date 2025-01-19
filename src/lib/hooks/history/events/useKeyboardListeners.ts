import { useEffect, useRef, useCallback } from "react";
import captureKeyboardListeners, {
  CaptureOptions,
  ReleaseListeners,
} from "../../utils/captureKeyboardListeners";
import { debounce, throttle } from "../../utils/schedulers";
import { useStableCallback } from "@/shared/hooks/base";

interface UseKeyboardListenersOptions extends CaptureOptions {
  throttle?: number;
  debounce?: number;
}

export default function useKeyboardListeners(
  options: UseKeyboardListenersOptions,
) {
  const releaseRef = useRef<ReleaseListeners | null>(null);
  const isPausedRef = useRef(false);

  const enhanceHandlers = useStableCallback(
    (options: UseKeyboardListenersOptions) => {
      const enhancedOptions: CaptureOptions = { ...options };

      Object.keys(options).forEach((key) => {
        const handlerName = key as keyof CaptureOptions;
        const originalHandler = options[handlerName];

        if (typeof originalHandler === "function") {
          if (options.throttle) {
            enhancedOptions[handlerName] = throttle(
              originalHandler,
              options.throttle,
            );
          } else if (options.debounce) {
            enhancedOptions[handlerName] = debounce(
              originalHandler,
              options.debounce,
            );
          }
        }
      });

      return enhancedOptions;
    },
  );

  useEffect(() => {
    const enhancedOptions = enhanceHandlers(options);
    releaseRef.current = captureKeyboardListeners(enhancedOptions);

    return () => {
      if (releaseRef.current) releaseRef.current();
    };
  }, [options, enhanceHandlers]);

  const pauseListeners = useStableCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      isPausedRef.current = true;
    }
  });

  const resumeListeners = useCallback(() => {
    if (isPausedRef.current) {
      releaseRef.current = captureKeyboardListeners(enhanceHandlers(options));
      isPausedRef.current = false;
    }
  }, [options, enhanceHandlers]);

  const releaseListeners = useStableCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
  });

  return {
    pauseListeners,
    resumeListeners,
    releaseListeners,
  };
}
