import { MAX_DATE_CELLS } from './constans';

export interface CalendarGrid {
  prevMonthGrid: number[];
  currentMonthGrid: number[];
  nextMonthGrid: number[];
}

export function buildCalendarGrid(date: Date): CalendarGrid {
  const year = date.getFullYear();
  const month = date.getMonth();

  const daysInCurrentMonth = 32 - new Date(year, month, 32).getDate();
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay() || 7;
  const daysInPrevMonth = 32 - new Date(year, month - 1, 32).getDate();

  const prevMonthDaysCount = firstDay - 1;
  const nextMonthDaysCount = MAX_DATE_CELLS - prevMonthDaysCount - daysInCurrentMonth;

  const prevMonthGrid = prevMonthDaysCount > 0 ?
    Array.from({ length: prevMonthDaysCount }, (_, i) => daysInPrevMonth - prevMonthDaysCount + i + 1) :
    [];

  const currentMonthGrid = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const nextMonthGrid = nextMonthDaysCount > 0 ?
    Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1) :
    [];

  return {
    prevMonthGrid,
    currentMonthGrid,
    nextMonthGrid
  };
}
