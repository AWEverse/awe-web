import { EMouseButton } from '@/lib/core';
import { RefObject, useEffect } from 'react';

export const BACKDROP_CLASSNAME = 'backdrop';

/**
 * High-performance hook for closing menus by clicking outside, without DOM overhead.
 * @param isOpen - Whether the menu is open
 * @param menuRef - Reference to the menu element
 * @param onClose - Callback to close the menu
 * @param ignoreRightClick - Skip handling right-click events
 * @param excludedClosestSelector - CSS selector for elements to exclude from closing
 */
export default function useVirtualBackdrop(
  isOpen: boolean,
  menuRef: RefObject<HTMLElement | null>,
  onClose?: () => void,
  ignoreRightClick = false,
  excludedClosestSelector?: string,
) {
  useEffect(() => {
    const menu = menuRef.current;

    if (!isOpen || !onClose || !menu) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (ignoreRightClick && e.button === EMouseButton.Secondary) {
        return;
      }

      if (menu.contains(target) && !target.classList.contains(BACKDROP_CLASSNAME)) {
        return;
      }

      if (
        excludedClosestSelector &&
        (target.matches(excludedClosestSelector) || target.closest(excludedClosestSelector))
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      onClose();
    };

    document.addEventListener('mousedown', handleClick, { passive: false });
    return () => { document.removeEventListener('mousedown', handleClick); }
  }, [isOpen, menuRef, onClose, ignoreRightClick, excludedClosestSelector]);
}
