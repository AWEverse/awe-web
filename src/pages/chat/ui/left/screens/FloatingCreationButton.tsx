import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import { EditRounded } from "@mui/icons-material";
import { FC, ReactNode } from "react";

interface OwnProps {
  children: ReactNode;
  className?: string;
  hideOnScroll?: boolean;
  transformOrigin?: number;
  transformOriginX?: number;
  transformOriginY?: number;
  isButtonVisible?: boolean;
}

const FloatingTrigger: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
  <IconButton active={isOpen} onClick={onTrigger}>
    <EditRounded />
  </IconButton>
);

const FloatingCreationButton: FC<OwnProps> = ({
  className,
  position,
  size = "medium",
  variant = "plain",
  transformOrigin = 0,
  transformOriginX,
  transformOriginY,
  isButtonVisible,
}) => {
  return (
    <Dropdown
      position={position}
      shouldClose={!isButtonVisible}
      triggerButton={FloatingTrigger}
    ></Dropdown>
  );
};

export default FloatingCreationButton;
