import { useState } from "react";
import { useStableCallback } from "@/shared/hooks/base";
import { ZoomLevel, NEXT_MONTH, PREVIOUS_MONTH } from "../constans";
import { CalendarAnimationType } from "../types";
import { isCurrentMonth } from "../validators";

export const useDatePickerControls = (
  setDate: (updater: (prev: any) => any) => void,
  minAt?: Date,
  maxAt?: Date,
) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);
  const [direction, setDirection] = useState<CalendarAnimationType>("LTR");

  const updateDirection = useStableCallback((newDirection: CalendarAnimationType) => {
    setDirection(newDirection);
  });

  const changeMonth = useStableCallback((increment: number) => {
    setDate((prev) => {
      const newSystemDate = new Date(prev.currentSystemDate);
      newSystemDate.setDate(1);
      newSystemDate.setMonth(newSystemDate.getMonth() + increment);

      if (!isCurrentMonth(newSystemDate)) {
        updateDirection(increment > 0 ? "RTL" : "LTR");
      }

      if (
        isNaN(newSystemDate.getTime()) ||
        (minAt && newSystemDate < minAt) ||
        (maxAt && newSystemDate > maxAt)
      ) {
        return prev;
      }
      return { ...prev, currentSystemDate: newSystemDate };
    });
  });

  const handlePrevMonth = () => changeMonth(PREVIOUS_MONTH);
  const handleNextMonth = () => changeMonth(NEXT_MONTH);
  const handleSwitchZoom = () => {
    updateDirection("zoomIn");
    setZoomLevel((prev) =>
      ZOOM_LEVELS[(ZOOM_LEVELS.indexOf(prev) + 1) % ZOOM_LEVELS.length],
    );
  };

  return {
    zoomLevel,
    direction,
    handlePrevMonth,
    handleNextMonth,
    handleSwitchZoom,
  };
};

const ZOOM_LEVELS = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR] as const;
