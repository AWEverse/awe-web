import { memo, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { CalendarViewProps } from "../lib/types";
import I18n from "@/shared/ui/i18n";

const TOTAL_CELL_COUNT = 16;
const MONTHS_PER_YEAR = 12;
const MONTH_ABBR_LENGTH = 3;

const MonthView = memo<CalendarViewProps>(({ date }) => {
  const { currentSystemDate } = date;
  const currentYear = currentSystemDate.getFullYear();
  const currentMonth = currentSystemDate.getMonth();

  const monthCells = useMemo(() => {
    return Array.from({ length: TOTAL_CELL_COUNT }, (_, index) => {
      const monthIndex = index % MONTHS_PER_YEAR;
      const isAnotherYear = index >= MONTHS_PER_YEAR;
      const isCurrentMonth = monthIndex === currentMonth && !isAnotherYear;

      const isoDate = new Date(currentYear, monthIndex, 1).toISOString();

      return {
        isoDate,
        key: `month-${index}`,
        monthIndex,
        isCurrentMonth,
        isAnotherYear,
      };
    });
  }, [currentMonth, currentYear]);

  return (
    <>
      {monthCells.map(
        ({ isoDate, key, monthIndex, isCurrentMonth, isAnotherYear }) => (
          <div
            key={key}
            data-isodate={isoDate}
            className={buildClassName(
              "dp-calendar-cell",
              isCurrentMonth && "dp-current-day",
              isAnotherYear && "dp-day--another",
            )}
          >
            <I18n
              i18nKey={`time.months.${monthIndex}`}
              manipulations={(s) => s.substring(0, MONTH_ABBR_LENGTH)}
            />
          </div>
        ),
      )}
    </>
  );
});

MonthView.displayName = "MonthView";

export default MonthView;
