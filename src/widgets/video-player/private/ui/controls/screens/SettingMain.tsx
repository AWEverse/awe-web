import ActionButton from "@/shared/ui/ActionButton";
import { FC, ReactNode } from "react";

interface OwnProps {
  onAmbientModeClick?: NoneToVoidFunction;
  onSpeedTimerClick?: NoneToVoidFunction;
  onQualityClick?: NoneToVoidFunction;
}

interface StateProps {
  quality?: string;
}

const SettingMain: FC<OwnProps & StateProps> = ({
  onAmbientModeClick,
  onQualityClick,
  onSpeedTimerClick,

  quality = "Auto (1080p)",
}) => {
  return (
    <div>
      <ActionButton>Stable volume</ActionButton>
      <ActionButton onClick={onAmbientModeClick}>Ambient Mode</ActionButton>
      <ActionButton onClick={onSpeedTimerClick}>Playback speed</ActionButton>
      <ActionButton
        endDecorator={renderAnnotation(quality)}
        onClick={onQualityClick}
      >
        Quality
      </ActionButton>
    </div>
  );
};

const renderAnnotation = (text: string) => {
  return (
    <span className={"font-mono text-xs text-gray-400"}>
      <span>{text}</span>
    </span>
  );
};

export default SettingMain;
