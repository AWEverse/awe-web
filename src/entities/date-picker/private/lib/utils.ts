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

// Utils — Bit-packing
export const packDate = (year: number, month: number, day: number): number =>
  (year << 9) | (month << 5) | day;

export const unpackDate = (packed: number): { year: number; month: number; day: number } => ({
  year: packed >> 9,
  month: (packed >> 5) & 0xF,
  day: packed & 0x1F,
});

export const isDateValid = (packed: number, min?: number, max?: number): boolean =>
  (!min || packed >= min) && (!max || packed <= max);

// Date math
export const getMonthDifference = (a: number, b: number): number => {
  const d1 = unpackDate(a);
  const d2 = unpackDate(b);
  return (d1.year - d2.year) * 12 + (d1.month - d2.month);
};

export const createNewMonthDate = (packed: number, increment: number): number => {
  const { year, month } = unpackDate(packed);
  const totalMonths = year * 12 + month + increment;
  return packDate(Math.floor(totalMonths / 12), totalMonths % 12, 1);
};

export const syncSystemDate = (selected: number): number => {
  const { year, month } = unpackDate(selected);
  return packDate(year, month, 1);
};
