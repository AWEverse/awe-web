import { MAX_DATE_CELLS } from './constans';

export function buildCalendarGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const prevMonthGrid: number[] = [];
  const currentMonthGrid: number[] = [];
  const nextMonthGrid: number[] = [];

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = 1; i < firstDay; i++) {
    prevMonthGrid.push(totalDaysInPrevMonth - firstDay + i + 1);
  }

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentMonthGrid.push(i);
  }

  const lastRowDaysCount = MAX_DATE_CELLS - (currentMonthGrid.length + prevMonthGrid.length);

  for (let i = 1; i <= lastRowDaysCount; i++) {
    nextMonthGrid.push(i);
  }

  return { prevMonthGrid, currentMonthGrid, nextMonthGrid };
}
