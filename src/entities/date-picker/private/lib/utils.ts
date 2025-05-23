import { MAX_DATE_CELLS } from "./constans";

export interface CalendarGrid {
  prevMonthGrid: number[];
  currentMonthGrid: number[];
  nextMonthGrid: number[];
}

export function buildCalendarGrid(date: Date): CalendarGrid {
  const year = date.getFullYear();
  const month = date.getMonth();

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();

  const firstDayAdjusted = firstDay === 0 ? 7 : firstDay;

  const prevMonthDaysCount = firstDayAdjusted - 1;

  const nextMonthDaysCount =
    MAX_DATE_CELLS - prevMonthDaysCount - daysInCurrentMonth;

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthGrid =
    prevMonthDaysCount > 0
      ? Array.from(
        { length: prevMonthDaysCount },
        (_, i) => daysInPrevMonth - prevMonthDaysCount + i,
      )
      : [];

  const currentMonthGrid = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => i,
  );

  const nextMonthGrid =
    nextMonthDaysCount > 0
      ? Array.from({ length: nextMonthDaysCount }, (_, i) => i)
      : [];

  return { prevMonthGrid, currentMonthGrid, nextMonthGrid };
}
// Utils — Bit-packing
export const packDate = (year: number, month: number, day: number): number =>
  (year << 9) | (month << 5) | day;

export const unpackDate = (
  packed: number,
): { year: number; month: number; day: number } => ({
  year: packed >> 9,
  month: (packed >> 5) & 0xf,
  day: packed & 0x1f,
});

export const isDateValid = (
  packed: number,
  min?: number,
  max?: number,
): boolean => (!min || packed >= min) && (!max || packed <= max);

// Date math
export const getMonthDifference = (a: number, b: number): number => {
  const d1 = unpackDate(a);
  const d2 = unpackDate(b);
  return (d1.year - d2.year) * 12 + (d1.month - d2.month);
};

export const createNewMonthDate = (
  packed: number,
  increment: number,
): number => {
  const { year, month } = unpackDate(packed);
  const totalMonths = year * 12 + month + increment;
  return packDate(Math.floor(totalMonths / 12), totalMonths % 12, 1);
};

export const syncSystemDate = (selected: number): number => {
  const { year, month } = unpackDate(selected);
  return packDate(year, month, 1);
};
