import React, { memo, useCallback, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { CalendarViewProps } from "../lib/types";
import { buildCalendarGrid } from "../lib/utils";
import DayCell from "./DayCell";
import useLongPress from "@/lib/hooks/history/events/useLongPress";

type TimeLapse = "prev" | "current" | "next";

const WeekView: React.FC<CalendarViewProps> = ({
  date,
  mode,
  onSelectDate,
  onLongPressEnd,
  onClick,
  onLongPressStart,
  onRightClick,
}) => {
  const { currentSystemDate, userSelectedDate } = date;

  // Memoize system date details
  const [currentDay, currentYear, currentMonth] = useMemo(
    () => [
      currentSystemDate.getDate(),
      currentSystemDate.getFullYear(),
      currentSystemDate.getMonth(),
    ],
    [currentSystemDate],
  );

  // Memoize user selected date details
  const [selectedDay, selectedMonth] = useMemo(
    () => [userSelectedDate.getDate(), userSelectedDate.getMonth()],
    [userSelectedDate],
  );

  // Memoize calendar grids
  const { prevMonthGrid, currentMonthGrid, nextMonthGrid } = useMemo(
    () => buildCalendarGrid(currentSystemDate),
    [currentSystemDate],
  );

  // Precompute date metadata for class names
  const dateMetadata = useMemo(
    () => ({
      isCurrentMonth: currentMonth === new Date().getMonth(),
      isSelectedMonth: currentMonth === selectedMonth,
    }),
    [currentMonth, selectedMonth],
  );

  // Stable event handlers using data attributes
  const handleSelectDate = useCallback(
    (e: React.MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const day = parseInt(target.dataset.day || "0", 10);
      const type = (target.dataset.type || "current") as TimeLapse;

      let newMonth = currentMonth;
      let newYear = currentYear;

      if (type === "prev") {
        newMonth = currentMonth - 1;
        if (newMonth < 0) {
          newMonth = 11;
          newYear = currentYear - 1;
        }
      } else if (type === "next") {
        newMonth = currentMonth + 1;
        if (newMonth > 11) {
          newMonth = 0;
          newYear = currentYear + 1;
        }
      }

      onSelectDate?.({ day, month: newMonth, year: newYear });
    },
    [currentMonth, currentYear, onSelectDate],
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const day = parseInt(target.dataset.day || "0", 10);
      const type = (target.dataset.type || "current") as TimeLapse;

      let month = currentMonth;
      let year = currentYear;

      if (type === "prev") {
        month = currentMonth - 1;
        if (month < 0) {
          month = 11;
          year = currentYear - 1;
        }
      } else if (type === "next") {
        month = currentMonth + 1;
        if (month > 11) {
          month = 0;
          year = currentYear + 1;
        }
      }

      onRightClick?.({ day, month, year });
    },
    [currentMonth, currentYear, onRightClick],
  );

  // Memoized long press listeners
  const longPressListeners = useLongPress({
    onClick,
    onStart: onLongPressStart,
    onEnd: onLongPressEnd,
    threshold: 300,
  });

  // Memoized grid renderer
  const renderDays = useCallback(
    (days: number[], type: TimeLapse = "current") => {
      return days.map((day) => {
        const isCurrentMonth = type === "current";
        const isCurrentDay =
          isCurrentMonth && day === currentDay && dateMetadata.isCurrentMonth;
        const isSelectedDay =
          isCurrentMonth && day === selectedDay && dateMetadata.isSelectedMonth;

        return (
          <DayCell
            key={`${type}-${day}`}
            className={buildClassName(
              "calendarCell",
              "dayCell",
              !isCurrentMonth && "another",
              isSelectedDay && "selectedDay",
              isCurrentDay && "currentDay",
            )}
            data-day={day}
            data-type={type}
            onClick={handleSelectDate}
            onContextMenu={handleRightClick}
            {...longPressListeners}
          >
            {day}
          </DayCell>
        );
      });
    },
    [
      currentDay,
      selectedDay,
      dateMetadata,
      handleSelectDate,
      handleRightClick,
      longPressListeners,
    ],
  );

  return (
    <>
      {renderDays(prevMonthGrid, "prev")}
      {renderDays(currentMonthGrid)}
      {renderDays(nextMonthGrid, "next")}
    </>
  );
};

export default memo(WeekView);
