import { useEffect, useRef, useCallback } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { throttle, debounce } from "@/lib/core";
import captureKeyboardListeners, {
  CaptureOptions,
  ReleaseListeners,
} from "@/lib/utils/captureKeyboardListeners";

interface UseKeyboardListenersOptions extends CaptureOptions {
  throttle?: number;
  debounce?: number;
}

const HANDLER_NAMES: (keyof CaptureOptions)[] = [
  "onEnter",
  "onBackspace",
  "onDelete",
  "onEsc",
  "onUp",
  "onDown",
  "onLeft",
  "onRight",
  "onTab",
  "onSpace",
];

export default function useKeyboardListeners(
  options: UseKeyboardListenersOptions,
) {
  const releaseRef = useRef<ReleaseListeners | null>(null);
  const isPausedRef = useRef(false);
  const cancelFunctionsRef = useRef<(() => void)[]>([]);

  const enhanceHandlers = useStableCallback(
    (currentOptions: UseKeyboardListenersOptions) => {
      if (process.env.NODE_ENV !== "production") {
        if (currentOptions.throttle && currentOptions.debounce) {
          console.warn(
            "Both throttle and debounce options provided. Throttle takes precedence.",
          );
        }
      }

      const enhancedOptions: CaptureOptions = {};

      HANDLER_NAMES.forEach((handlerName) => {
        const originalHandler = currentOptions[handlerName];

        if (typeof originalHandler !== "function") return;

        if (currentOptions.throttle) {
          enhancedOptions[handlerName] = throttle(
            originalHandler,
            currentOptions.throttle,
          );
        } else if (currentOptions.debounce) {
          enhancedOptions[handlerName] = debounce(
            originalHandler,
            currentOptions.debounce,
          );
        } else {
          enhancedOptions[handlerName] = originalHandler;
        }
      });

      return enhancedOptions;
    },
  );

  useEffect(() => {
    const enhancedOptions = enhanceHandlers(options);

    cancelFunctionsRef.current = [];

    HANDLER_NAMES.forEach((handlerName) => {
      const handler = enhancedOptions[handlerName];
      if (handler && typeof handler === "function" && "cancel" in handler) {
        cancelFunctionsRef.current.push((handler as any).cancel);
      }
    });

    releaseRef.current = captureKeyboardListeners(enhancedOptions);

    return () => {
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }

      cancelFunctionsRef.current.forEach((cancel) => cancel());
      cancelFunctionsRef.current = [];
    };
  }, [options, enhanceHandlers]);

  const pauseListeners = useStableCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      isPausedRef.current = true;

      // Cancel any pending throttled/debounced calls
      cancelFunctionsRef.current.forEach((cancel) => cancel());
      cancelFunctionsRef.current = [];
    }
  });

  const resumeListeners = useCallback(() => {
    if (isPausedRef.current) {
      const enhancedOptions = enhanceHandlers(options);
      releaseRef.current = captureKeyboardListeners(enhancedOptions);
      isPausedRef.current = false;
    }
  }, [options, enhanceHandlers]);

  const releaseListeners = useStableCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
    cancelFunctionsRef.current.forEach((cancel) => cancel());
    cancelFunctionsRef.current = [];
  });

  return {
    pauseListeners,
    resumeListeners,
    releaseListeners,
  };
}

// function MyComponent() {
//   const { pauseListeners, resumeListeners } = useKeyboardListeners({
//     onKeyDown: (e) => console.log('Key pressed:', e.key),
//     throttle: 200,
//   });

//   // Pause listeners when component loses focus
//   const handleBlur = () => pauseListeners();

//   // Resume listeners when component gains focus
//   const handleFocus = () => resumeListeners();

//   return (
//     <div onBlur={handleBlur} onFocus={handleFocus}>
//       Keyboard interactive area
//     </div>
//   );
// }
