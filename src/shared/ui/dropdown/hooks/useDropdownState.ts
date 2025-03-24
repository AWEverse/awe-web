import { useState, useCallback, useEffect } from "react";

const useDropdownState = ({
  onOpen,
  onClose,
  shouldClose,
}: {
  onOpen?: NoneToVoidFunction;
  onClose?: NoneToVoidFunction;
  shouldClose?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const newValue = !prev;
      newValue ? onOpen?.() : onClose?.();
      return newValue;
    });
  }, [onOpen, onClose]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (shouldClose) handleClose();
  }, [shouldClose, handleClose]);

  return { isOpen, handleToggle, handleClose };
};

export default useDropdownState;
