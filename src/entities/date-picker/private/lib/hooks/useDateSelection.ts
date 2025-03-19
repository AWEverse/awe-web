import { initDateRange, initGridPosition } from "@/entities/date-picker/public/ui/config";
import { throttle } from "@/lib/core";
import { useState, useRef, useEffect, useCallback } from "react";
import { CURRENT_MONTH, PREVIOUS_MONTH, JANUARY, DECEMBER, NEXT_MONTH, CELL_SIZE } from "../constans";
import { DateRangeData, ISelectDate } from "../types";

// Date Selection Hook - Enhanced reliability
const useDateSelection = ({
  initialDate,
  onChange,
  changeMonth,
  isRangeSelectionDisabled,
  minAt,
  maxAt,
}: {
  initialDate: Date;
  onChange?: (date: Date) => void;
  changeMonth: (increment: number) => void;
  isRangeSelectionDisabled: boolean;
  minAt?: Date;
  maxAt?: Date;
}) => {
  const [date, setDate] = useState<DateRangeData>({
    currentSystemDate: initialDate,
    userSelectedDate: initialDate,
    dateRange: initDateRange,
    gridPosition: initGridPosition,
  });

  const selectedCount = useRef(0);
  const isLongPressActive = useRef(false);

  useEffect(() => {
    if (isRangeSelectionDisabled) {
      isLongPressActive.current = false;
      selectedCount.current = 0;
    }
  }, [isRangeSelectionDisabled]);

  const isDateWithinBounds = useCallback((date: Date): boolean => {
    if (minAt && date < minAt) return false;
    if (maxAt && date > maxAt) return false;
    return true;
  }, [minAt, maxAt]);

  const handleSelectDate = useCallback(({ day = 1, month = 0, year = 0 }: ISelectDate = {}) => {
    const newDate = new Date(year, month, day);

    if (!isDateWithinBounds(newDate)) return;

    setDate((prev) => {
      const updatedState = { ...prev, userSelectedDate: newDate };

      if (!isRangeSelectionDisabled) {
        const currentMonth = prev.currentSystemDate.getMonth();
        const targetMonth = newDate.getMonth();
        const monthDiff = targetMonth - currentMonth;

        if (monthDiff !== CURRENT_MONTH) {
          const isPrevMonth = monthDiff === PREVIOUS_MONTH ||
            (currentMonth === JANUARY && targetMonth === DECEMBER);
          const isNextMonth = monthDiff === NEXT_MONTH ||
            (currentMonth === DECEMBER && targetMonth === JANUARY);

          if (isPrevMonth) {
            setTimeout(() => changeMonth(PREVIOUS_MONTH), 0);
          } else if (isNextMonth) {
            setTimeout(() => changeMonth(NEXT_MONTH), 0);
          }
        }

        if (isLongPressActive.current) {
          selectedCount.current += 1;

          if (selectedCount.current === 1) {
            updatedState.dateRange = { from: newDate, to: undefined };
          } else if (selectedCount.current === 2) {
            const from = prev.dateRange.from || newDate;
            const to = newDate;

            updatedState.dateRange = {
              from: from < to ? from : to,
              to: from < to ? to : from
            };

            isLongPressActive.current = false;
            selectedCount.current = 0;
          }
        }
      }

      return updatedState;
    });

    onChange?.(newDate);
  }, [isRangeSelectionDisabled, changeMonth, onChange, isDateWithinBounds]);

  const handleLongPress = useCallback(() => {
    if (!isRangeSelectionDisabled) {
      isLongPressActive.current = true;
      selectedCount.current = 0;

      setDate(prev => ({
        ...prev,
        dateRange: initDateRange
      }));
    }
  }, [isRangeSelectionDisabled]);

  const handleMouseOver = useCallback(throttle((e: React.MouseEvent<HTMLDivElement>) => {
    if (isRangeSelectionDisabled || !isLongPressActive.current || !date.dateRange.from || date.dateRange.to) return;

    e.preventDefault();
    const target = e.target as HTMLElement;

    if (target && target.dataset.calendarCell) {
      const column = Math.floor(target.offsetLeft / CELL_SIZE);
      const row = Math.floor(target.offsetTop / CELL_SIZE);

      setDate((prev) => ({
        ...prev,
        gridPosition: { columns: column, rows: row }
      }));
    }
  }, 50), [date.dateRange.from, date.dateRange.to, isRangeSelectionDisabled]);

  return { date, setDate, handleSelectDate, handleLongPress, handleMouseOver };
};

export default useDateSelection;
