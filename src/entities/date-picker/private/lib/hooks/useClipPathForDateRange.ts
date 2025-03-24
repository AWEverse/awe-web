import { useMemo } from 'react';
import calculateGridSelection from '../helpers/calculateGridSelection';
import { DateRange } from '../types';
import { COLUMNS, MAX_DATE_CELLS /*42*/ } from '../constans';

export default function useClipPathForDateRange(
  dateRange: DateRange,// {from, to}
  gridPosition: { rows: number; columns: number },
  disabled: boolean,
) {
  return useMemo(() => {
    if (disabled) return 'none';
    if (!dateRange?.from) return 'none';

    const startIndex = getDayIndexInMonth(dateRange.from) - 1;
    const lastIndex = gridPosition.rows * COLUMNS + gridPosition.columns + 1;

    return calculateGridSelection(startIndex, lastIndex);
  }, [dateRange, gridPosition, getDayIndexInMonth, calculateGridSelection]);
}

function getDayIndexInMonth(date = new Date()) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() || 7;
  const currentDay = date.getDate();

  const firstDayIndex = firstDayOfMonth;

  return (currentDay + firstDayIndex - 1) % MAX_DATE_CELLS;
}
