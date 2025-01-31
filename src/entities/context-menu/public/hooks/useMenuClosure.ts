import { RefObject, useEffect } from "react";
import { useClickAway } from "@/lib/hooks/history/events/useClick";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";

interface UseMenuClosureOptions {
  /** Size of the boundary around the menu (in pixels) */
  outboxSize?: number;
  /** Throttle interval for boundary checks (in milliseconds) */
  throttleInterval?: number;
}

const DEFAULT_OPTIONS: UseMenuClosureOptions = {
  outboxSize: 100,
  throttleInterval: 100,
};

/**
 * A hook to handle menu closure logic, including click-away and boundary detection.
 * @param isOpen - Whether the menu is currently open
 * @param ref - Reference to the menu element
 * @param onClose - Callback to close the menu
 * @param options - Configuration options for the hook
 */
const useMenuClosure = (
  isOpen: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
  options?: UseMenuClosureOptions,
) => {
  const { outboxSize, throttleInterval } = options || DEFAULT_OPTIONS;

  useClickAway(ref, onClose);

  useBoundaryCheck({
    elementRef: ref,
    isActive: isOpen,
    onExit: onClose,
    options: { outboxSize, throttleInterval },
  });
};

export default useMenuClosure;
