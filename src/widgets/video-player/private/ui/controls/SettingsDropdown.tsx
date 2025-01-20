import ActionButton from "@/shared/ui/ActionButton";
import DropdownMenu, { TriggerProps } from "@/shared/ui/DropdownMenu";
import { FC, memo, useState } from "react";
import s from "./SettingsDropdown.module.scss";
import { useStableCallback } from "@/shared/hooks/base";

interface OwnProps<T extends Record<string, unknown> = {}> {
  position: string;
  triggerButton: FC<T & TriggerProps>;
  onStableVolumeClick?: (flag: boolean) => void;
  onAmbientModeClick?: (flag: boolean) => void;
  onPlaybackSpeedClick?: (value: number) => void;
  onSpeedTimerClick?: (value: number) => void;
  onQualityClick?: (value: string) => void;
}

const SettingsDropdown: FC<OwnProps> = ({
  position = "bottom-right",
  triggerButton,
  onStableVolumeClick,
  onAmbientModeClick,
  onPlaybackSpeedClick,
  onSpeedTimerClick,
  onQualityClick,
}) => {
  const [quality, setQuality] = useState<string>("Auto (1080p)");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const handleStableVolumeClick = useStableCallback(() => {
    onStableVolumeClick?.(true); // You can adjust the flag based on the toggle.
  });

  const handleAmbientModeClick = useStableCallback(() => {
    onAmbientModeClick?.(true); // Toggle ambient mode
  });

  const handlePlaybackSpeedClick = useStableCallback((value: number) => {
    setPlaybackSpeed(value);
    onPlaybackSpeedClick?.(value);
  });

  const handleSpeedTimerClick = useStableCallback((value: number) => {
    onSpeedTimerClick?.(value);
  });

  const handleQualityClick = useStableCallback((value: string) => {
    setQuality(value);
    onQualityClick?.(value);
  });

  return (
    <DropdownMenu triggerButton={triggerButton} position={position}>
      <ActionButton onClick={handleStableVolumeClick}>
        Stable volume
      </ActionButton>
      <ActionButton onClick={handleAmbientModeClick}>Ambient Mode</ActionButton>
      <ActionButton onClick={() => handlePlaybackSpeedClick(1.25)}>
        Playback speed
      </ActionButton>
      <ActionButton onClick={() => handleSpeedTimerClick(10)}>
        Speed timer
      </ActionButton>
      <ActionButton
        endDecorator={renderAnnotation(quality)}
        onClick={() => handleQualityClick("Auto (1080p)")}
      >
        Quality
      </ActionButton>
    </DropdownMenu>
  );
};

const renderAnnotation = (text: string) => {
  return (
    <span className={s.annotation}>
      <span className={s.annotationText}>{text}</span>
    </span>
  );
};

export default memo(SettingsDropdown);
