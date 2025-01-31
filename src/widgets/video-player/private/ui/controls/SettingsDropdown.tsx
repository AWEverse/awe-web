import ActionButton from "@/shared/ui/ActionButton";

import DropdownMenu, { TriggerProps } from "@/shared/ui/dropdown";
import { FC, memo, useCallback, useState } from "react";
import s from "./SettingsDropdown.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import { AnimatePresence, motion } from "motion/react";

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
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);

  // Optimized handler using useCallback
  const handleSpeedChange = useCallback(
    (value: number) => {
      setPlaybackSpeed(value);
      onPlaybackSpeedClick?.(value);
    },
    [onPlaybackSpeedClick],
  );

  // Stable callback with animation support
  const toggleSpeedSlider = useStableCallback(() => {
    console.log(showSpeedSlider);
    setShowSpeedSlider(!showSpeedSlider);
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
    <DropdownMenu
      triggerButton={triggerButton}
      position={
        position as "bottom-right" | "top-right" | "top-left" | "bottom-left"
      }
    >
      <ActionButton>Stable volume</ActionButton>
      <ActionButton onClick={handleAmbientModeClick}>Ambient Mode</ActionButton>
      <ActionButton onClick={toggleSpeedSlider}>Playback speed</ActionButton>
      <AnimatePresence mode="wait">
        {showSpeedSlider && (
          <motion.div
            key="speedSlider"
            layout // Add layout animation
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 300 }, // Smoother animation
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: { duration: 0.15 },
            }}
            className={s.sliderWrapper}
          >
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className={s.speedSlider}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
