import { EMouseButton } from '@/lib/core';
import { RefObject, useEffect } from 'react';

export const BACKDROP_CLASSNAME = 'backdrop';

// This effect implements closing menus by clicking outside of them
// without adding extra elements to the DOM
export default function useVirtualBackdrop(
  isOpen: boolean,
  menuRef: RefObject<HTMLElement | null>,
  onClose?: () => void | undefined,
  ignoreRightClick?: boolean,
  excludedClosestSelector?: string,
) {
  useEffect(() => {
    if (!isOpen || !onClose) {
      return undefined;
    }

    const handleEvent = (e: MouseEvent) => {
      const menu = menuRef.current;
      const target = e.target as HTMLElement | null;

      if (!menu || !target || (ignoreRightClick && e.button === EMouseButton.Secondary)) {
        return;
      }

      if (
        (!menu.contains(e.target as Node | null) ||
          target.classList.contains(BACKDROP_CLASSNAME)) &&
        !(
          excludedClosestSelector &&
          (target.matches(excludedClosestSelector) || target.closest(excludedClosestSelector))
        )
      ) {
        e.stopPropagation();
        e.preventDefault();

        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleEvent);

    return () => {
      document.removeEventListener('mousedown', handleEvent);
    };
  }, [excludedClosestSelector, ignoreRightClick, isOpen, menuRef, onClose]);
}
