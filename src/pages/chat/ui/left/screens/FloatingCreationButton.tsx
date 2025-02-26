import { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import { EditRounded } from "@mui/icons-material";
import { FC, ReactNode } from "react";

interface OwnProps {
  children: ReactNode;
}

const FloatingTrigger: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
  <IconButton active={isOpen} onClick={onTrigger}>
    <EditRounded />
  </IconButton>
);

const FloatingCreationButton: FC<OwnProps> = () => {
  return <></>;
};

export default FloatingCreationButton;
