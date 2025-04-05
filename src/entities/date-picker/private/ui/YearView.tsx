import buildClassName from "@/shared/lib/buildClassName";
import { FC, memo, useMemo } from "react";
import { CalendarViewProps, EDatePickerView } from "../lib/types";

// Constants for better maintainability
const YEARS_RANGE = 16;
const YEARS_OFFSET = 5;

const YearView: FC<CalendarViewProps> = ({ date }) => {
  const { currentSystemDate } = date;
  const currentYear = currentSystemDate.getFullYear();
  const todayYear = new Date().getFullYear();

  const years = useMemo(() => {
    const startYear = currentYear - YEARS_OFFSET;
    return Array.from({ length: YEARS_RANGE }, (_, i) => startYear + i);
  }, [currentYear]);

  const getIsoDate = (year: number) => new Date(year, 0, 1).toISOString();

  return (
    <>
      {years.map((year) => {
        const isCurrentYear = year === todayYear;
        return (
          <div
            data-isodate={getIsoDate(year + 1)}
            key={year}
            className={buildClassName(
              "dp-calendar-cell",
              isCurrentYear && "dp-current-day",
            )}
          >
            {year}
          </div>
        );
      })}
    </>
  );
};

export default memo(YearView);
