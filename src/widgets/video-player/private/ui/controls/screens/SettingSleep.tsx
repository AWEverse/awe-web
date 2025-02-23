import { FC, ReactNode } from "react";
import { SettingMainProps } from "./types";
import { IconButton } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";

interface OwnProps extends SettingMainProps {}

interface StateProps {}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SettingSleep: FC<OwnProps & StateProps> = ({ onBackClick }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      {SPEEDS.map((speed) => (
        <ActionButton key={speed}>
          <span>{speed}x</span>
        </ActionButton>
      ))}

      <MenuSeparator />

      <ActionButton
        onClick={onBackClick}
        icon={<ArrowBackRounded fontSize="small" />}
        label="Go back"
        size="md"
      />
    </div>
  );
};

export default SettingSleep;
