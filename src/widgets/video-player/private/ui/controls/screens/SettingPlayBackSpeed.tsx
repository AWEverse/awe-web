import { FC, memo } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SpeedIcon from "@mui/icons-material/Speed";
import ActionButton from "@/shared/ui/ActionButton";
import MenuSeparator from "@/shared/ui/MenuSeparator";
import RangeSlider from "@/shared/ui/RangeSlider";
import { ArrowBackRounded } from "@mui/icons-material";

interface OwnProps {
  onSpeedTimerClick?: () => void;
  onBackClick?: () => void;
}

interface StateProps {
  speed?: number;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SettingPlayBackSpeed: FC<OwnProps & StateProps> = ({
  onSpeedTimerClick,
  onBackClick,

  speed = 2,
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <RangeSlider
        label="Playback speed"
        min={0}
        max={2}
        value={0}
        onChange={function (value: number): void {
          throw new Error("Function not implemented.");
        }}
      />

      {SPEEDS.map((speed) => (
        <ActionButton
          key={speed}
          label={`${speed}x`}
          endDecorator={
            speed === 1 && (
              <SpeedIcon
                className="text-gray-400 ml-auto mt-auto"
                fontSize="small"
              />
            )
          }
        />
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

export default memo(SettingPlayBackSpeed);
