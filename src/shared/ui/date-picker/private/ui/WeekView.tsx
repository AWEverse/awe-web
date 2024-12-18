import React, { memo, useCallback, useMemo } from 'react';
import buildClassName from '@/shared/lib/buildClassName';
import { CalendarViewProps } from '../lib/types';
import { buildCalendarGrid } from '../lib/utils';
import useLongPress from '@/lib/hooks/events/useLongPress';

const WeekView: React.FC<CalendarViewProps> = ({
  date,
  onSelectDate,
  onLongPressEnd,
  onClick,
  onLongPressStart,
  onRightClick,
}) => {
  const { currentSystemDate, userSelectedDate } = date;

  const currentDay = new Date().getDate();
  const currentYear = currentSystemDate.getFullYear();
  const currentMonth = currentSystemDate.getMonth();
  const selectedDay = userSelectedDate.getDate();
  const selectedMonth = userSelectedDate.getMonth();

  const { prevMonthGrid, currentMonthGrid, nextMonthGrid } = useMemo(
    () => buildCalendarGrid(currentSystemDate),
    [currentSystemDate],
  );

  const getDayClassName = useCallback(
    (day: number, isCurrentMonth: boolean): string | undefined => {
      const isCurrentDay = day === currentDay && currentMonth === new Date().getMonth();
      const isCurrentSelectedDay = day === selectedDay && currentMonth === selectedMonth;

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
    threshold: 500,
  });

  const handleSelectDate = (day: number) =>
    useCallback(() => {
      onSelectDate?.({ day, month: currentMonth, year: currentYear });
    }, [currentMonth, currentSystemDate, onSelectDate]);

  const handleRightClick = useCallback(
    (event: React.MouseEvent | React.TouchEvent, day: number) => {
      event.preventDefault();
      if (onRightClick) {
        onRightClick({ day, month: currentMonth, year: currentYear });
      }
    },
    [currentMonth, currentSystemDate, onRightClick],
  );

  const renderDays = useCallback(
    (days: number[], isCurrentMonth = false) => {
      return days.map(day => (
        <div
          key={day}
          className={buildClassName(
            'calendarCell',
            'dayCell',
            getDayClassName(day, isCurrentMonth),
          )}
          onClick={handleSelectDate(day)}
          onContextMenu={event => handleRightClick(event, day)}
          {...longPressListeners}
        >
          {day}
        </div>
      ));
    },
    [getDayClassName, handleSelectDate, handleRightClick, longPressListeners],
  );

  return (
    <>
      {renderDays(prevMonthGrid)}
      {renderDays(currentMonthGrid, true)}
      {renderDays(nextMonthGrid)}
    </>
  );
};

export default memo(WeekView);
