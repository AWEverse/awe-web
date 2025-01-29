import { useClickAway } from "@/lib/hooks/history/events/useClick";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";
import { RefObject } from "react";

const BOUNDARY_CHECK_OPTIONS = {
  outboxSize: 100,
  throttleInterval: 100,
};

const useMenuClosure = (
  isOpen: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) => {
  useClickAway(ref, onClose);
  useBoundaryCheck({
    elementRef: ref,
    isActive: isOpen,
    onExit: onClose,
    options: BOUNDARY_CHECK_OPTIONS,
  });
};

export default useMenuClosure;
