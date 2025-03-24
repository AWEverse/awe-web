import { FC, MouseEvent, ReactNode } from "react";
import ActionButton from "@/shared/ui/ActionButton";
import buildClassName from "@/shared/lib/buildClassName";

interface ChatActionButtonProps {
  isToggled: boolean;
  labelOn?: string;
  labelOff?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const ChatActionButton: FC<ChatActionButtonProps> = ({
  isToggled,
  labelOn,
  labelOff,
  icon,
  onClick,
  className,
}) => {
  return (
    <ActionButton
      active={isToggled}
      className={buildClassName(className)}
      icon={icon}
      label={isToggled ? labelOff : labelOn}
      onClick={onClick}
    />
  );
};

export default ChatActionButton;
