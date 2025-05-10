import React, { memo, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { CalendarViewProps, EDatePickerView } from "../lib/types";
import { buildCalendarGrid } from "../lib/utils";

const getIsoDate = (
  year: number,
  month: number,
  day: number,
  monthOffset: -1 | 0 | 1,
) => new Date(year, month + monthOffset, day).toISOString().slice(0, 10); // yyyy-mm-dd

const DayCell = React.memo(
  ({
    isoDate,
    day,
    isToday,
    isCurrentMonth,
    isSelectedDay,
    isCurrentDay,
    buildClassName,
  }: {
    isoDate: string;
    day: number;
    isToday: boolean;
    isCurrentMonth: boolean;
    isSelectedDay: boolean;
    isCurrentDay: boolean;
    buildClassName: (...classes: (string | boolean | undefined)[]) => string;
  }) => {
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
  },
);

DayCell.displayName = "CalendarDayCell";

function renderDays({
  days,
  type,
  currentYear,
  currentMonth,
  currentDay,
  selectedDay,
  isCurrentMonthNow,
  isSelectedMonth,
  todayISO,
  buildClassName,
}: {
  days: number[];
  type: "prev" | "current" | "next";
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  selectedDay: number;
  isCurrentMonthNow: boolean;
  isSelectedMonth: boolean;
  todayISO: string;
  buildClassName: (...args: any[]) => string;
}) {
  const isCurrentMonth = type === "current";
  const monthOffset = type === "prev" ? -1 : type === "next" ? 1 : 0;

  return days.map((day) => {
    const isoDate = getIsoDate(currentYear, currentMonth, day + 1, monthOffset);
    const isCurrentDay =
      isCurrentMonth && day === currentDay && isCurrentMonthNow;
    const isSelectedDay =
      isCurrentMonth && day === selectedDay && isSelectedMonth;
    const isToday = isoDate === todayISO;

    return (
      <DayCell
        key={isoDate}
        isoDate={isoDate}
        day={day + 1}
        isToday={isToday}
        isCurrentMonth={isCurrentMonth}
        isSelectedDay={isSelectedDay}
        isCurrentDay={isCurrentDay}
        buildClassName={buildClassName}
      />
    );
  });
}

const WeekView: React.FC<CalendarViewProps> = ({ date }) => {
  const { currentSystemDate, userSelectedDate } = date;

  const now = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => now.toISOString().slice(0, 10), [now]);
  const currentYear = currentSystemDate.getFullYear();
  const currentMonth = currentSystemDate.getMonth();
  const currentDay = currentSystemDate.getDate();
  const selectedDay = userSelectedDate.getDate();
  const isCurrentMonthNow =
    currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const isSelectedMonth = currentMonth === userSelectedDate.getMonth();

  const grids = useMemo(
    () => buildCalendarGrid(currentSystemDate),
    [currentSystemDate],
  );

  return (
    <>
      {renderDays({
        days: grids.prevMonthGrid,
        type: "prev",
        currentYear,
        currentMonth,
        currentDay,
        selectedDay,
        isCurrentMonthNow,
        isSelectedMonth,
        todayISO,
        buildClassName,
      })}
      {renderDays({
        days: grids.currentMonthGrid,
        type: "current",
        currentYear,
        currentMonth,
        currentDay,
        selectedDay,
        isCurrentMonthNow,
        isSelectedMonth,
        todayISO,
        buildClassName,
      })}
      {renderDays({
        days: grids.nextMonthGrid,
        type: "next",
        currentYear,
        currentMonth,
        currentDay,
        selectedDay,
        isCurrentMonthNow,
        isSelectedMonth,
        todayISO,
        buildClassName,
      })}
    </>
  );
};

export default React.memo(WeekView, (prevProps, nextProps) => {
  return (
    prevProps.date.currentSystemDate.getTime() ===
      nextProps.date.currentSystemDate.getTime() &&
    prevProps.date.userSelectedDate.getTime() ===
      nextProps.date.userSelectedDate.getTime()
  );
});
