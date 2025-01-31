import captureKeyboardListeners from "@/lib/utils/captureKeyboardListeners";
import { useEffect } from "react";

const useDropdownAccessibility = ({
  onClose,
  onEnter,
}: {
  onClose?: NoneToVoidFunction;
  onEnter?: NoneToVoidFunction;
}) => {
  useEffect(
    () => captureKeyboardListeners({ onEsc: onClose, onEnter }),
    [onClose, onEnter],
  );
};

export default useDropdownAccessibility;
