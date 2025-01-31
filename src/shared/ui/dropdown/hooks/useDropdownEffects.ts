import useBodyClass from "@/shared/hooks/DOM/useBodyClass";
import { useBoundaryCheck } from "@/shared/hooks/mouse/useBoundaryCheck";

export const useDropdownEffects = ({
  isOpen,
  dropdownRef,
  handleClose,
}: {
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLElement | null>;
  handleClose: NoneToVoidFunction;
}) => {
  useBodyClass("has-open-dialog", isOpen);
  useBoundaryCheck({
    elementRef: dropdownRef,
    isActive: isOpen,
    onExit: handleClose,
    options: { outboxSize: 60, throttleInterval: 250 },
  });
};

export default useDropdownEffects;
