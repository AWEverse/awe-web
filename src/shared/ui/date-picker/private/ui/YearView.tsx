import buildClassName from '@/shared/lib/buildClassName';
import { FC, memo, useMemo } from 'react';
import { ZoomLevel } from '../lib/constans';
import { CalendarViewProps } from '../lib/types';
import { invoke } from '@/lib/core';

const YearView: FC<CalendarViewProps> = ({ date, onSelectDate }) => {
  const { currentSystemDate } = date;
  const currentYear = currentSystemDate.getFullYear();

  const years = useMemo(
    () => Array.from({ length: 16 }, (_, i) => currentYear - 5 + i),
    [currentYear],
  );

  const handleClick = (year: number) => () => {
    invoke(onSelectDate, { day: undefined, month: undefined, year, level: ZoomLevel.MONTH });
  };

  return (
    <>
      {years.map(year => (
        <div
          key={year}
          className={buildClassName(
            'calendarCell',
            year === new Date().getFullYear() ? 'currentDay' : undefined,
          )}
          onClick={handleClick(year)}
        >
          {year}
        </div>
      ))}
    </>
  );
};

export default memo(YearView);
