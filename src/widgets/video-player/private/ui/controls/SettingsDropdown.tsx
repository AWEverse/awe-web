import DropdownMenu, { TriggerProps } from "@/shared/ui/dropdown";
import { FC, JSX, memo, useState } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { AnimatePresence, motion } from "framer-motion";
import SettingSleep from "./screens/SettingSleep";
import SettingPlayBackSpeed from "./screens/SettingPlayBackSpeed";
import SettingMain from "./screens/SettingMain";
import SettingQuality from "./screens/SettingQuality";

type Screen = "Main" | "Speed" | "Quality" | "Timer";

interface SettingsDropdownProps<T extends Record<string, unknown> = {}> {
  position?: "bottom-right" | "top-right" | "top-left" | "bottom-left";
  triggerButton: FC<T & TriggerProps>;
  onStableVolumeClick?: (flag: boolean) => void;
  onAmbientModeClick?: (flag: boolean) => void;
  onPlaybackSpeedClick?: (value: number) => void;
  onSpeedTimerClick?: (value: number) => void;
  onQualityClick?: (value: string) => void;
}

const ANIMATION_DURATION = 0.125;

const SettingsDropdown: FC<SettingsDropdownProps> = ({
  position = "bottom-right",
  triggerButton,
  onAmbientModeClick,
  onQualityClick,
  onSpeedTimerClick,
}) => {
  const [screen, setScreen] = useState<Screen>("Main");

  const resetScreen = useStableCallback(() => setScreen("Main"));

  const handleAmbientModeClick = useStableCallback(() => {
    onAmbientModeClick && onAmbientModeClick(true);
  });

  const handleSpeedTimerClick = useStableCallback(() => setScreen("Speed"));
  const handleQualityClick = useStableCallback(() => setScreen("Quality"));

  const isMain = screen === "Main";
  const initialX = isMain ? "-100%" : "100%";
  const exitX = initialX;

  return (
    <DropdownMenu triggerButton={triggerButton} position={position}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={screen}
          initial={{ x: initialX }}
          animate={{ x: 0 }}
          exit={{ x: exitX }}
          transition={{
            duration: ANIMATION_DURATION,
          }}
        >
          {
            {
              Main: (
                <SettingMain
                  onQualityClick={handleQualityClick}
                  onAmbientModeClick={handleAmbientModeClick}
                  onSpeedTimerClick={handleSpeedTimerClick}
                />
              ),
              Speed: <SettingPlayBackSpeed onBackClick={resetScreen} />,
              Quality: <SettingQuality onBackClick={resetScreen} />,
              Timer: <SettingSleep onBackClick={resetScreen} />,
            }[screen]
          }
        </motion.div>
      </AnimatePresence>
    </DropdownMenu>
  );
};

export default memo(SettingsDropdown);
