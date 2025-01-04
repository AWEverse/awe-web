import React, { memo, useCallback, useMemo } from 'react';
import buildClassName from '@/shared/lib/buildClassName';
import { CalendarViewProps } from '../lib/types';
import { buildCalendarGrid } from '../lib/utils';
import useLongPress from '@/lib/hooks/events/useLongPress';
import DayCell from './DayCell';

type TimeLapse = 'prev' | 'current' | 'next';

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

  const currentDay = currentSystemDate.getDate();
  const currentYear = currentSystemDate.getFullYear();
  const currentMonth = currentSystemDate.getMonth();
  const selectedDay = userSelectedDate.getDate();
  const selectedMonth = userSelectedDate.getMonth();

  // Memoize the calendar grids to avoid recalculating unless currentSystemDate changes
  const { prevMonthGrid, currentMonthGrid, nextMonthGrid } = useMemo(
    () => buildCalendarGrid(currentSystemDate),
    [currentSystemDate],
  );

  // Memoize getDayClassName to avoid unnecessary recalculation
  const getDayClassName = useCallback(
    (day: number, isCurrentMonth: boolean): string | undefined => {
      const isCurrentDay = day === currentDay && currentMonth === new Date().getMonth();
      const isCurrentSelectedDay = day === selectedDay && currentMonth === selectedMonth;
      // Mode-based conditions
      const isFutureMode = mode === 'future' && day >= currentDay;
      const isPastMode = mode === 'past' && day <= currentDay;
      const isAllMode = mode === 'all';

      return buildClassName(
        !isCurrentMonth && 'another',
        isCurrentMonth && isCurrentSelectedDay && 'selectedDay',
        isCurrentMonth && isCurrentDay && 'currentDay',
      );
    },
    [currentDay, currentMonth, selectedDay, selectedMonth],
  );

  const longPressListeners = useLongPress({
    onClick,
    onStart: onLongPressStart,
    onEnd: onLongPressEnd,
    threshold: 300,
  });

  const handleSelectDate = useCallback(
    (day: number, type: TimeLapse = 'current') => {
      let newMonth = currentMonth;
      let newYear = currentYear;

      if (type === 'prev') {
        newMonth -= 1;

        if (newMonth < 0) {
          newMonth = 11;
          newYear -= 1;
        }
      } else if (type === 'next') {
        newMonth += 1;

        if (newMonth > 11) {
          newMonth = 0;
          newYear += 1;
        }
      }

      onSelectDate?.({ day, month: newMonth, year: newYear });
    },
    [currentMonth, currentYear, onSelectDate],
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent, day: number) => {
      e.preventDefault();

      onRightClick?.({ day, month: currentMonth, year: currentYear });
    },
    [currentMonth, currentYear, onRightClick],
  );

  const renderDays = useCallback(
    (days: number[], type: TimeLapse = 'current') => {
      return days.map(day => (
        <DayCell
          key={day.toString()}
          className={buildClassName(
            'calendarCell',
            'dayCell',
            getDayClassName(day, type === 'current'),
          )}
          onClick={() => handleSelectDate(day, type)}
          onContextMenu={event => handleRightClick(event, day)}
          {...longPressListeners}
        >
          {day}
        </DayCell>
      ));
    },
    [getDayClassName, handleSelectDate, handleRightClick, longPressListeners],
  );

  return (
    <>
      {renderDays(prevMonthGrid, 'prev')}
      {renderDays(currentMonthGrid)}
      {renderDays(nextMonthGrid, 'next')}
    </>
  );
};

export default memo(WeekView);
