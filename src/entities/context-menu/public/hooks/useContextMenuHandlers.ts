import {
  IS_TOUCH_ENV,
  IS_PWA,
  IS_IOS,
  EMouseButton,
  IVector2,
  EKeyboardKey,
} from "@/lib/core";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { requestMutation } from "@/lib/modules/fastdom";
import {
  addExtraClass,
  removeExtraClass,
} from "@/shared/lib/extraClassHelpers";
import { RefObject, useReducer, useRef, useCallback, useEffect } from "react";
import useEffectSync from "../../../../shared/hooks/effects/useEffectSync";
import { useStableCallback } from "@/shared/hooks/base";
import { noop } from "@/lib/utils/listener";

const LONG_TAP_DURATION_MS = 200;
const DEFAULT_IOS_PWA_CONTEXT_MENU_DELAY_MS = 100;

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;

  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  }) as T;
}

function stopEvent(e: Event, shouldStop: boolean = true) {
  if (shouldStop) {
    e.stopImmediatePropagation();
    e.preventDefault();
    e.stopPropagation();
  }
}

type ContextMenuState = {
  isOpen: boolean;
  anchor?: IVector2;
  target?: HTMLElement;
};

type ContextMenuAction =
  | {
    type: 'OPEN';
    anchor: IVector2;
    target: HTMLElement;
  }
  | { type: 'CLOSE' }
  | { type: 'HIDE' };

const initialState: ContextMenuState = {
  isOpen: false,
  anchor: undefined,
  target: undefined,
};

const contextMenuReducer = (
  state: ContextMenuState,
  action: ContextMenuAction
): ContextMenuState => {
  switch (action.type) {
    case 'OPEN':
      // Prevent duplicate OPEN actions if already open
      if (state.isOpen) return state;
      return { isOpen: true, anchor: action.anchor, target: action.target };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'HIDE':
      return { ...state, anchor: undefined, target: undefined };
    default:
      return state;
  }
};

type UseContextMenuHandlersParams = {
  elementRef: RefObject<HTMLElement | null>;
  isMenuDisabled?: boolean;
  shouldDisableOnLink?: boolean;
  shouldDisableOnLongTap?: boolean;
  readySignal?: ReadonlySignal<boolean>;
  shouldDisablePropagation?: boolean;
  iosPWADelay?: number; // configurable iOS delay
};

const useContextMenuHandlers = (
  {
    elementRef,
    isMenuDisabled,
    shouldDisableOnLink,
    shouldDisableOnLongTap,
    readySignal,
    shouldDisablePropagation = true,
    iosPWADelay = DEFAULT_IOS_PWA_CONTEXT_MENU_DELAY_MS,
  }: UseContextMenuHandlersParams
) => {
  const [contextMenuState, dispatch] = useReducer(contextMenuReducer, initialState);

  const isMenuDisabledRef = useRef(isMenuDisabled);
  const contextMenuAnchorRef = useRef<IVector2 | undefined>(contextMenuState.anchor);
  const timerRef = useRef<number | null>(null);

  useEffectSync(() => {
    isMenuDisabledRef.current = isMenuDisabled;
    contextMenuAnchorRef.current = contextMenuState.anchor;
  }, [isMenuDisabled, contextMenuState.anchor]);

  const debouncedAddExtraClass = useStableCallback(
    debounce((target: HTMLElement) => {
      requestMutation(() => {
        addExtraClass(target, "no-selection");
      });
    }, 16)
  );

  const debouncedRemoveExtraClass = useStableCallback(
    debounce((target: HTMLElement) => {
      requestMutation(() => {
        removeExtraClass(target, "no-selection");
      });
    }, 16)
  );

  const handleBeforeContextMenu = useStableCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isMenuDisabledRef.current && e.button === EMouseButton.Secondary) {
        debouncedAddExtraClass(e.target as HTMLElement);
      }
    }
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      debouncedRemoveExtraClass(e.target as HTMLElement);

      if (
        isMenuDisabledRef.current ||
        (shouldDisableOnLink && (e.target as HTMLElement).matches("a[href]"))
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      dispatch({
        type: 'OPEN',
        anchor: { x: e.clientX, y: e.clientY },
        target: e.target as HTMLElement,
      });
    },
    [shouldDisableOnLink, debouncedRemoveExtraClass]
  );

  const handleContextMenuClose = useStableCallback(() => {
    dispatch({ type: 'CLOSE' });
  });

  const handleContextMenuHide = useStableCallback(() => {
    dispatch({ type: 'HIDE' });
  });

  const handleKeyDown = useStableCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.shiftKey && e.code === EKeyboardKey.F10) {
      e.preventDefault();
      const element = elementRef.current;
      const rect = element?.getBoundingClientRect();
      const anchor = rect ? { x: rect.left, y: rect.top } : { x: 0, y: 0 };
      dispatch({
        type: 'OPEN',
        anchor,
        target: element as HTMLElement,
      });
    }
  });

  useEffect(() => {
    if (
      isMenuDisabled ||
      !IS_TOUCH_ENV ||
      shouldDisableOnLongTap ||
      (readySignal && !readySignal.value)
    ) {
      return noop;
    }

    const element = elementRef.current;
    if (!element) return noop;

    const clearLongPressTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const emulateContextMenuEvent = (originalEvent: TouchEvent) => {
      clearLongPressTimer();
      // Prevent duplicate triggers if already open
      if (isMenuDisabledRef.current || contextMenuState.isOpen) return;

      const touch = originalEvent.touches[0];
      if (!touch) return;
      const { clientX, clientY, target } = touch;
      const shouldDisable =
        shouldDisableOnLink && (target as HTMLElement).matches("a[href]");

      if (contextMenuAnchorRef.current || shouldDisable) return;

      // Collect listeners for robust cleanup
      const listeners: {
        type: string;
        handler: EventListenerOrEventListenerObject;
        options?: boolean | EventListenerOptions;
      }[] = [];

      const preventClick = (e: Event) => stopEvent(e, shouldDisablePropagation);
      document.addEventListener("touchend", preventClick, true);
      listeners.push({ type: "touchend", handler: preventClick, options: true });

      if (IS_PWA && IS_IOS) {
        const preventInteraction = (e: Event) => stopEvent(e, shouldDisablePropagation);
        document.addEventListener("mousedown", preventInteraction, true);
        document.addEventListener("click", preventInteraction, true);
        listeners.push({ type: "mousedown", handler: preventInteraction, options: true });
        listeners.push({ type: "click", handler: preventInteraction, options: true });

        // Cleanup after the configurable delay
        setTimeout(() => {
          listeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.handler, listener.options);
          });
        }, iosPWADelay);
      } else {
        // Immediate cleanup for non-iOS scenarios
        setTimeout(() => {
          listeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.handler, listener.options);
          });
        }, 0);
      }

      dispatch({
        type: 'OPEN',
        anchor: { x: clientX, y: clientY },
        target: target as HTMLElement,
      });
    };

    const startLongPressTimer = (e: TouchEvent) => {
      if (shouldDisablePropagation) {
        e.stopPropagation();
      }
      clearLongPressTimer();
      timerRef.current = window.setTimeout(() => emulateContextMenuEvent(e), LONG_TAP_DURATION_MS);
    };

    element.addEventListener("touchstart", startLongPressTimer, { passive: true });
    element.addEventListener("touchcancel", clearLongPressTimer, true);
    element.addEventListener("touchend", clearLongPressTimer, true);
    element.addEventListener("touchmove", clearLongPressTimer, { passive: true });

    // Cleanup on unmount
    return () => {
      clearLongPressTimer();
      element.removeEventListener("touchstart", startLongPressTimer);
      element.removeEventListener("touchcancel", clearLongPressTimer, true);
      element.removeEventListener("touchend", clearLongPressTimer, true);
      element.removeEventListener("touchmove", clearLongPressTimer);
    };
  }, [
    isMenuDisabled,
    shouldDisableOnLongTap,
    elementRef,
    shouldDisableOnLink,
    readySignal,
    shouldDisablePropagation,
    iosPWADelay,
    contextMenuState.isOpen,
  ]);

  return {
    isContextMenuOpen: contextMenuState.isOpen,
    contextMenuAnchor: contextMenuState.anchor,
    contextMenuTarget: contextMenuState.target,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
    handleKeyDown, // Expose the keyboard handler for accessibility
  };
};

export default useContextMenuHandlers;
