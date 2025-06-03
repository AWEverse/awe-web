import { EMouseButton } from "@/lib/core";
import { RefObject, useEffect, useRef } from "react";
import { useComponentWillUnmount } from "../effects/useLifecycle";

export const BACKDROP_CLASSNAME = "backdrop";

export interface VirtualBackdropOptions {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Reference to the menu element */
  menuRef: RefObject<HTMLElement | null>;
  /** Callback to close the menu */
  onClose?: () => void;
  /** Skip handling right-click events (default: false) */
  ignoreRightClick?: boolean;
  /** CSS selector for elements to exclude from closing */
  excludedClosestSelector?: string;
  /** Enable Escape key to close (default: true) */
  enableEscapeKey?: boolean;
  /** Custom events to trigger closing (e.g., 'touchstart') */
  customEvents?: string[];
  /** Delay in ms before closing (useful for animations, default: 0) */
  closeDelay?: number;
}

/**
 * High-performance hook for closing menus by clicking outside or via other triggers,
 * with minimal DOM overhead and flexible configuration.
 */
export default function useVirtualBackdrop({
  isOpen,
  menuRef,
  onClose,
  ignoreRightClick = false,
  excludedClosestSelector,
  enableEscapeKey = true,
  customEvents = [],
  closeDelay = 0,
}: VirtualBackdropOptions) {
  const timeoutRef = useRef<number | null>(null);

  const handleClose = () => {
    if (!onClose) return;
    if (closeDelay > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(onClose, closeDelay);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const menu = menuRef.current;
    if (!isOpen || !onClose || !menu) return;

    const handleTrigger = (e: Event) => {
      const target = e.target as HTMLElement;

      if (
        e instanceof MouseEvent &&
        ignoreRightClick &&
        e.button === EMouseButton.Secondary
      ) {
        return;
      }

      if (
        menu.contains(target) &&
        !target.classList.contains(BACKDROP_CLASSNAME)
      ) {
        return;
      }

      if (
        excludedClosestSelector &&
        (target.matches(excludedClosestSelector) ||
          target.closest(excludedClosestSelector))
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      handleClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && enableEscapeKey) {
        e.stopPropagation();
        handleClose();
      }
    };

    const events = ["mousedown", ...customEvents];
    events.forEach((event) => {
      document.addEventListener(event, handleTrigger, { passive: false });
    });

    if (enableEscapeKey) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleTrigger);
      });
      if (enableEscapeKey) {
        document.removeEventListener("keydown", handleKeyDown);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    isOpen,
    menuRef,
    onClose,
    ignoreRightClick,
    excludedClosestSelector,
    enableEscapeKey,
    customEvents,
    closeDelay,
  ]);

  useComponentWillUnmount(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });
}
