import { IS_TOUCH_ENV, IS_PWA, IS_IOS, EMouseButton } from "@/lib/core";
import { ReadonlySignal } from "@/lib/core/public/signals";
import { requestMutation } from "@/lib/modules/fastdom/fastdom";
import {
  addExtraClass,
  removeExtraClass,
} from "@/shared/lib/extraClassHelpers";
import { RefObject, useState, useRef, useEffect } from "react";
import useEffectSync from "../../../../shared/hooks/effects/useEffectSync";
import { useStableCallback } from "../../../../shared/hooks/base";

const LONG_TAP_DURATION_MS = 200;
const IOS_PWA_CONTEXT_MENU_DELAY_MS = 100;

function stopEvent(e: Event) {
  e.stopImmediatePropagation();
  e.preventDefault();
  e.stopPropagation();
}

type IAnchorPosition = { x: number; y: number };

type ContextMenuState = {
  isOpen: boolean;
  anchor: IAnchorPosition | undefined;
  target: HTMLElement | undefined;
};

const useContextMenuHandlers = (
  elementRef: RefObject<HTMLElement | null>,
  isMenuDisabled?: boolean,
  shouldDisableOnLink?: boolean,
  shouldDisableOnLongTap?: boolean,
  readySignal?: ReadonlySignal<boolean>,
  shouldDisablePropagation?: boolean,
) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    isOpen: false,
    anchor: undefined,
    target: undefined,
  });

  const isMenuDisabledRef = useRef(isMenuDisabled);
  const contextMenuAnchorRef = useRef(contextMenuState.anchor);

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

  const handleContextMenu = useStableCallback(
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

      setContextMenuState({
        isOpen: true,
        anchor: { x: e.clientX, y: e.clientY },
        target: e.target as HTMLElement,
      });
    },
  );

  const handleContextMenuClose = useStableCallback(() => {
    setContextMenuState((prev) => ({ ...prev, isOpen: false }));
  });

  const handleContextMenuHide = useStableCallback(() => {
    setContextMenuState((prev) => ({
      ...prev,
      anchor: undefined,
      target: undefined,
    }));
  });

  useEffect(() => {
    if (
      isMenuDisabled ||
      !IS_TOUCH_ENV ||
      shouldDisableOnLongTap ||
      (readySignal && !readySignal.value)
    ) {
      return undefined;
    }

    const element = elementRef.current;
    if (!element) return undefined;

    let timer: number | undefined;

    const clearLongPressTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const emulateContextMenuEvent = (originalEvent: TouchEvent) => {
      clearLongPressTimer();
      if (isMenuDisabledRef.current) return;

      const { clientX, clientY, target } = originalEvent.touches[0];
      const shouldDisable =
        shouldDisableOnLink && (target as HTMLElement).matches("a[href]");

      if (contextMenuAnchorRef.current || shouldDisable) return;

      const handlePreventClick = (e: Event) => {
        stopEvent(e);
        document.removeEventListener("touchend", handlePreventClick, {
          capture: true,
        });
      };

      document.addEventListener("touchend", handlePreventClick, {
        capture: true,
      });

      if (IS_PWA && IS_IOS) {
        const preventInteraction = (e: Event) => {
          stopEvent(e);
          document.removeEventListener("mousedown", preventInteraction, {
            capture: true,
          });
          document.removeEventListener("click", preventInteraction, {
            capture: true,
          });
        };

        document.addEventListener("mousedown", preventInteraction, {
          capture: true,
        });
        document.addEventListener("click", preventInteraction, {
          capture: true,
        });

        setTimeout(() => {
          document.removeEventListener("mousedown", preventInteraction, {
            capture: true,
          });
          document.removeEventListener("click", preventInteraction, {
            capture: true,
          });
        }, IOS_PWA_CONTEXT_MENU_DELAY_MS);
      }

      setContextMenuState({
        isOpen: true,
        anchor: { x: clientX, y: clientY },
        target: target as HTMLElement,
      });
    };

    const startLongPressTimer = (e: TouchEvent) => {
      if (shouldDisablePropagation) e.stopPropagation();
      clearLongPressTimer();
      timer = window.setTimeout(
        () => emulateContextMenuEvent(e),
        LONG_TAP_DURATION_MS,
      );
    };

    element.addEventListener("touchstart", startLongPressTimer, {
      passive: true,
    });
    element.addEventListener("touchcancel", clearLongPressTimer, true);
    element.addEventListener("touchend", clearLongPressTimer, true);
    element.addEventListener("touchmove", clearLongPressTimer, {
      passive: true,
    });

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
