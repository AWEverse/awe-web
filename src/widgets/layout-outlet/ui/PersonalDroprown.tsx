import Dropdown, { TriggerProps } from "@/shared/ui/dropdown";
import IconButton from "@/shared/ui/IconButton";
import { FC, memo } from "react";

import "./PersonalDroprown.scss";

interface OwnProps {}

interface StateProps {}

const PersonalTriggerButton: FC<TriggerProps> = ({ onTrigger }) => {
  return (
    <IconButton onClick={onTrigger}>
      <img
        className="PersonalIconButton"
        src="https://avatars.githubusercontent.com/u/116294957?v=4"
      />
    </IconButton>
  );
};

const PersonalDropdown: FC<OwnProps & StateProps> = () => {
  return (
    <Dropdown triggerButton={PersonalTriggerButton} position="top-right">
      rekfakfksak
    </Dropdown>
  );
};

export default memo(PersonalDropdown);
