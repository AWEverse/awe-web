import {
  IS_TOUCH_ENV,
  IS_PWA,
  IS_IOS,
  EMouseButton,
  IVector2,
  EKeyboardKey,
  debounce,
} from "@/lib/core";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { requestMutation } from "@/lib/modules/fastdom";
import { addExtraClass, removeExtraClass } from "@/shared/lib/extraClassHelpers";
import { RefObject, useReducer, useRef, useCallback, useEffect } from "react";
import useEffectSync from "../../../../shared/hooks/effects/useEffectSync";
import { useStableCallback } from "@/shared/hooks/base";

const LONG_TAP_DURATION_MS = 200;
const DEFAULT_IOS_PWA_CONTEXT_MENU_DELAY_MS = 100;

type ContextMenuState = {
  isOpen: boolean;
  anchor?: IVector2;
  target?: HTMLElement;
};

type ContextMenuAction =
  | { type: "OPEN"; anchor: IVector2; target: HTMLElement }
  | { type: "CLOSE" }
  | { type: "HIDE" };

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
    case "OPEN":
      if (state.isOpen) return state;
      return { isOpen: true, anchor: action.anchor, target: action.target };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "HIDE":
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
  iosPWADelay?: number;
};

const useContextMenuHandlers = ({
  elementRef,
  isMenuDisabled = false,
  shouldDisableOnLink = false,
  shouldDisableOnLongTap = false,
  readySignal,
  shouldDisablePropagation = true,
  iosPWADelay = DEFAULT_IOS_PWA_CONTEXT_MENU_DELAY_MS,
}: UseContextMenuHandlersParams) => {
  const [state, dispatch] = useReducer(contextMenuReducer, initialState);
  const timerRef = useRef<number | null>(null);
  const isMenuDisabledRef = useRef(isMenuDisabled);
  const isTouchInitiatedRef = useRef(false); // Track touch-initiated events

  useEffectSync(() => {
    isMenuDisabledRef.current = isMenuDisabled;
  }, [isMenuDisabled]);

  const debouncedAddExtraClass = useStableCallback(
    debounce((target: HTMLElement) => {
      requestMutation(() => addExtraClass(target, "no-selection"));
    }, 16)
  );

  const debouncedRemoveExtraClass = useStableCallback(
    debounce((target: HTMLElement) => {
      requestMutation(() => removeExtraClass(target, "no-selection"));
    }, 16)
  );

  const stopEvent = useCallback((e: Event) => {
    if (shouldDisablePropagation) {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
    }
  }, [shouldDisablePropagation]);

  const openContextMenu = useCallback(
    (anchor: IVector2, target: HTMLElement) => {
      if (!isMenuDisabledRef.current && !state.isOpen) {
        dispatch({ type: "OPEN", anchor, target });
      }
    },
    [state.isOpen]
  );

  const handleBeforeContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isMenuDisabledRef.current && e.button === EMouseButton.Secondary) {
        debouncedAddExtraClass(e.target as HTMLElement);
      }
    },
    [debouncedAddExtraClass]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      debouncedRemoveExtraClass(e.target as HTMLElement);
      if (
        isMenuDisabledRef.current ||
        isTouchInitiatedRef.current || // Ignore if touch-initiated
        (shouldDisableOnLink && (e.target as HTMLElement).matches("a[href]"))
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      openContextMenu({ x: e.clientX, y: e.clientY }, e.target as HTMLElement);
    },
    [shouldDisableOnLink, debouncedRemoveExtraClass, stopEvent, openContextMenu]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.shiftKey && e.code === EKeyboardKey.F10) {
        e.preventDefault();
        e.stopPropagation();

        const element = elementRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        openContextMenu({ x: rect.left, y: rect.top }, element);
      }
    },
    [elementRef, stopEvent, openContextMenu]
  );

  useEffect(() => {
    if (
      isMenuDisabled ||
      !IS_TOUCH_ENV ||
      shouldDisableOnLongTap ||
      (readySignal && !readySignal.value)
    ) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const setupTemporaryListeners = (): Array<NoneToVoidFunction> => {
      const cleanupListeners: Array<NoneToVoidFunction> = [];
      const preventDefault = (ev: Event) => stopEvent(ev);

      document.addEventListener("touchend", preventDefault, true);
      cleanupListeners.push(() =>
        document.removeEventListener("touchend", preventDefault, true)
      );

      if (IS_PWA && IS_IOS) {
        const preventInteraction = (ev: Event) => stopEvent(ev);
        document.addEventListener("mousedown", preventInteraction, true);
        document.addEventListener("click", preventInteraction, true);
        cleanupListeners.push(() =>
          document.removeEventListener("mousedown", preventInteraction, true)
        );
        cleanupListeners.push(() =>
          document.removeEventListener("click", preventInteraction, true)
        );
      }
      return cleanupListeners;
    };

    const handleLongTap = (touch: Touch) => {
      isTouchInitiatedRef.current = true;
      const cleanupListeners = setupTemporaryListeners();
      openContextMenu(
        { x: touch.clientX, y: touch.clientY },
        touch.target as HTMLElement
      );
      setTimeout(() => {
        cleanupListeners.forEach((cleanup) => cleanup());
        isTouchInitiatedRef.current = false; // Reset after cleanup
      }, IS_PWA && IS_IOS ? iosPWADelay : 0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (shouldDisablePropagation) e.stopPropagation();
      clearTimer();
      const touch = e.touches[0];

      if (
        !touch ||
        (shouldDisableOnLink && (touch.target as HTMLElement).matches("a[href]"))
      ) {
        return;
      }

      timerRef.current = window.setTimeout(
        () => handleLongTap(touch),
        LONG_TAP_DURATION_MS
      );
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchcancel", clearTimer, true);
    element.addEventListener("touchend", clearTimer, true);
    element.addEventListener("touchmove", clearTimer, { passive: true });

    return () => {
      clearTimer();
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchcancel", clearTimer, true);
      element.removeEventListener("touchend", clearTimer, true);
      element.removeEventListener("touchmove", clearTimer);
    };
  }, [
    isMenuDisabled,
    shouldDisableOnLongTap,
    shouldDisableOnLink,
    readySignal,
    shouldDisablePropagation,
    iosPWADelay,
    elementRef,
    stopEvent,
    openContextMenu,
  ]);

  return {
    isContextMenuOpen: state.isOpen,
    contextMenuAnchor: state.anchor,
    contextMenuTarget: state.target,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose: () => dispatch({ type: "CLOSE" }),
    handleContextMenuHide: () => dispatch({ type: "HIDE" }),
    handleKeyDown,
  };
};

export default useContextMenuHandlers;
