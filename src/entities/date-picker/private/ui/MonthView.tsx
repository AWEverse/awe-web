import { memo, useCallback } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { CalendarViewProps } from "../lib/types";
import I18n from "@/shared/ui/i18n";
import { ZoomLevel } from "../lib/constans";

const TOTAL_CELL_COUNT = 16;
const MONTHS_PER_YEAR = 12;
const MONTH_ABBR_LENGTH = 3;

const MonthView = memo<CalendarViewProps>(({ date, onSelectDate }) => {
  const { currentSystemDate } = date;

  const renderMonthCell = useCallback(
    (index: number) => {
      const currentYear = currentSystemDate.getFullYear();
      const currentMonth = currentSystemDate.getMonth();

      const monthIndex = index % MONTHS_PER_YEAR;
      const isAnotherYear = index >= MONTHS_PER_YEAR;
      const isCurrentMonth = index === currentMonth && !isAnotherYear;

      return (
        <div
          key={`month-${index}`}
          className={buildClassName(
            "dp-calendar-cell",
            isCurrentMonth && "dp-current-day",
            isAnotherYear && "dp-day--another",
          )}
          onClick={() =>
            onSelectDate?.({
              day: undefined,
              month: monthIndex,
              year: currentYear,
              level: ZoomLevel.WEEK,
            })
          }
        >
          <I18n
            i18nKey={`time.months.${monthIndex}`}
            manipulations={(s) => s.substring(0, MONTH_ABBR_LENGTH)}
          />
        </div>
      );
    },
    [currentSystemDate, onSelectDate],
  );

  return (
    <>
      {Array.from({ length: TOTAL_CELL_COUNT }, (_, i) => renderMonthCell(i))}
    </>
  );
});

MonthView.displayName = "MonthView";

export default MonthView;
