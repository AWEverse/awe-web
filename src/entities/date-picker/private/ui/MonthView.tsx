import React, { memo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { MONTH_LIST, ZoomLevel } from "../lib/constans";
import { CalendarViewProps } from "../lib/types";

const MonthView: React.FC<CalendarViewProps> = ({ date, onSelectDate }) => {
  const { currentSystemDate } = date;

  const handleClick = (month: number) => () => {
    onSelectDate?.({
      day: undefined,
      month,
      year: currentSystemDate.getFullYear(),
      level: ZoomLevel.WEEK,
    });
  };

  return MONTH_LIST.map((month, index) => {
    const key = index < MONTH_LIST.length - 4 ? month : `${month}_copy`;

    const anotherMonth = index >= MONTH_LIST.length - 4 ? "another" : undefined;
    const currentMonth =
      index === currentSystemDate.getMonth() ? "currentDay" : undefined;

    return (
      <div
        key={key}
        className={buildClassName("calendarCell", currentMonth, anotherMonth)}
        onClick={handleClick(index)}
      >
        {""}
      </div>
    );
  });
};

export default memo(MonthView);
