import React, { memo, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { CalendarViewProps, EDatePickerView } from "../lib/types";
import { buildCalendarGrid } from "../lib/utils";

const WeekView: React.FC<CalendarViewProps> = ({ date }) => {
  const { currentSystemDate, userSelectedDate } = date;

  const {
    grids,
    currentYear,
    currentMonth,
    currentDay,
    selectedDay,
    isCurrentMonthNow,
    isSelectedMonth,
    todayISO,
  } = useMemo(() => {
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10); // yyyy-mm-dd

    const currentYear = currentSystemDate.getFullYear();
    const currentMonth = currentSystemDate.getMonth();

    return {
      grids: buildCalendarGrid(currentSystemDate),
      currentYear,
      currentMonth,
      currentDay: currentSystemDate.getDate(),
      selectedDay: userSelectedDate.getDate(),
      isCurrentMonthNow:
        currentMonth === now.getMonth() && currentYear === now.getFullYear(),
      isSelectedMonth: currentMonth === userSelectedDate.getMonth(),
      todayISO,
    };
  }, [currentSystemDate, userSelectedDate]);

  const getIsoDate = (day: number, monthOffset: -1 | 0 | 1) =>
    new Date(currentYear, currentMonth + monthOffset, day)
      .toISOString()
      .slice(0, 10); // yyyy-mm-dd

  const renderDays = (days: number[], type: "prev" | "current" | "next") => {
    const isCurrentMonth = type === "current";
    const monthOffset = type === "prev" ? -1 : type === "next" ? 1 : 0;

    return days.map((day) => {
      const isoDate = getIsoDate(day, monthOffset);
      const isCurrentDay =
        isCurrentMonth && day === currentDay && isCurrentMonthNow;

      const isSelectedDay =
        isCurrentMonth && day === selectedDay && isSelectedMonth;

      const isToday = isoDate === todayISO;

      return (
        <div
          key={isoDate}
          data-isodate={isoDate}
          className={buildClassName(
            "dp-calendar-cell",
            "dp-day-cell",
            isToday && "dp-day--current",
            !isCurrentMonth && "dp-day--another",
            isSelectedDay && "dp-day--selected",
            isCurrentDay && "dp-current-day",
          )}
        >
          {day}
        </div>
      );
    });
  };

  return (
    <>
      {renderDays(grids.prevMonthGrid, "prev")}
      {renderDays(grids.currentMonthGrid, "current")}
      {renderDays(grids.nextMonthGrid, "next")}
    </>
  );
};

export default memo(WeekView);
