import {
  IS_TOUCH_ENV,
  IS_PWA,
  IS_IOS,
  EMouseButton,
  IVector2,
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
const IOS_PWA_CONTEXT_MENU_DELAY_MS = 100;

function stopEvent(e: Event) {
  e.stopImmediatePropagation();
  e.preventDefault();
  e.stopPropagation();
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
    target: HTMLElement
  }
  | { type: 'CLOSE' }
  | { type: 'HIDE' };

const initialState = {
  isOpen: false,
  anchor: undefined,
  target: undefined,
}

const contextMenuReducer = (state: ContextMenuState, action: ContextMenuAction): ContextMenuState => {
  switch (action.type) {
    case 'OPEN':
      return { isOpen: true, anchor: action.anchor, target: action.target };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'HIDE':
      return { ...state, anchor: undefined, target: undefined };
    default:
      return state;
  }
};

const useContextMenuHandlers = (
  elementRef: RefObject<HTMLElement | null>,
  isMenuDisabled?: boolean,
  shouldDisableOnLink?: boolean,
  shouldDisableOnLongTap?: boolean,
  readySignal?: ReadonlySignal<boolean>,
  shouldDisablePropagation?: boolean,
) => {
  const { 0: contextMenuState, 1: dispatch } = useReducer(contextMenuReducer, initialState);

  const isMenuDisabledRef = useRef(isMenuDisabled);
  const contextMenuAnchorRef = useRef(contextMenuState.anchor);
  const timerRef = useRef<number | null>(null);

  useEffectSync(() => {
    isMenuDisabledRef.current = isMenuDisabled;
    contextMenuAnchorRef.current = contextMenuState.anchor;
  }, [isMenuDisabled, contextMenuState.anchor]);

  const handleBeforeContextMenu = useStableCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isMenuDisabledRef.current && e.button === EMouseButton.Secondary) {
        requestMutation(() => {
          addExtraClass(e.target as HTMLElement, "no-selection");
        });
      }
    },
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      requestMutation(() => {
        removeExtraClass(e.target as HTMLElement, "no-selection");
      });

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
    [shouldDisableOnLink],
  );

  const handleContextMenuClose = useStableCallback(() => {
    dispatch({ type: 'CLOSE' });
  });

  const handleContextMenuHide = useStableCallback(() => {
    dispatch({ type: 'HIDE' });
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
      if (isMenuDisabledRef.current) return noop;

      const touch = originalEvent.touches[0];
      if (!touch) return;
      const { clientX, clientY, target } = touch;
      const shouldDisable =
        shouldDisableOnLink && (target as HTMLElement).matches("a[href]");

      // Avoid multiple context menu triggers
      if (contextMenuAnchorRef.current || shouldDisable) return noop;

      // Prevent click events after long press
      const handlePreventClick = (e: Event) => {
        stopEvent(e);
        document.removeEventListener("touchend", handlePreventClick, true);
      };

      document.addEventListener("touchend", handlePreventClick, true);

      // For iOS PWA, also block mousedown and click events briefly
      if (IS_PWA && IS_IOS) {
        const preventInteraction = (e: Event) => {
          stopEvent(e);
          document.removeEventListener("mousedown", preventInteraction, true);
          document.removeEventListener("click", preventInteraction, true);
        };

        document.addEventListener("mousedown", preventInteraction, true);
        document.addEventListener("click", preventInteraction, true);

        setTimeout(() => {
          document.removeEventListener("mousedown", preventInteraction, true);
          document.removeEventListener("click", preventInteraction, true);
        }, IOS_PWA_CONTEXT_MENU_DELAY_MS);
      }

      dispatch({
        type: 'OPEN',
        anchor: { x: clientX, y: clientY },
        target: target as HTMLElement,
      });
    };

    const startLongPressTimer = (e: TouchEvent) => {
      if (shouldDisablePropagation) e.stopPropagation();
      clearLongPressTimer();
      timerRef.current = window.setTimeout(() => emulateContextMenuEvent(e), LONG_TAP_DURATION_MS);
    };

    // Add touch event listeners with consistent options
    element.addEventListener("touchstart", startLongPressTimer, { passive: true });
    element.addEventListener("touchcancel", clearLongPressTimer, true);
    element.addEventListener("touchend", clearLongPressTimer, true);
    element.addEventListener("touchmove", clearLongPressTimer, { passive: true });

    // Cleanup listeners on unmount
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
  ]);

  return {
    isContextMenuOpen: contextMenuState.isOpen,
    contextMenuAnchor: contextMenuState.anchor,
    contextMenuTarget: contextMenuState.target,
    handleBeforeContextMenu,
    handleContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
  };
};

export default useContextMenuHandlers;
