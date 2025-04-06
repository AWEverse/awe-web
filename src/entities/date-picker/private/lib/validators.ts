// Optimized utility to convert input to Date
const toDate = (date: Date | number | string): Date => {
  if (date instanceof Date) return new Date(date); // Always return new instance
  return new Date(date);
};

// Optimized comparison of two dates (ignores time)
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Optimized month comparison
const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

// Single cached today instance for current checks
const getToday = (() => {
  let today: Date;
  return () => {
    const now = new Date();
    if (!today || !isSameDay(today, now)) {
      today = now;
    }
    return today;
  };
})();

// Optimized month navigation with bit manipulation
const getPreviousMonth = (month: number, year: number): number => {
  return (month - 1 + 12) % 12 | ((year - (month === 0 ? 1 : 0)) << 4);
};

const getNextMonth = (month: number, year: number): number => {
  return (month + 1) % 12 | ((year + (month === 11 ? 1 : 0)) << 4);
};

// Extract month and year from packed value
const unpackMonthYear = (packed: number) => ({
  month: packed & 0xF,
  year: packed >> 4
});

// Check if date is today
export const isCurrentDay = (date: Date | number | string): boolean => {
  return isSameDay(toDate(date), getToday());
};

// Check if date is in current month
export const isCurrentMonth = (date: Date | number | string): boolean => {
  return isSameMonth(toDate(date), getToday());
};

// Optimized check for previous month relative to current date
export const isPreviousMonth = (date: Date | number | string): boolean => {
  const inputDate = toDate(date);
  const today = getToday();
  const packedPrev = getPreviousMonth(today.getMonth(), today.getFullYear());
  const { month: prevMonth, year: prevYear } = unpackMonthYear(packedPrev);
  return (
    inputDate.getMonth() === prevMonth &&
    inputDate.getFullYear() === prevYear
  );
};

// Check if date is in current year
export const isCurrentYear = (date: Date | number | string): boolean => {
  return toDate(date).getFullYear() === getToday().getFullYear();
};

// Optimized date range check
export const isDateInRange = (
  date: Date | number | string,
  startDate: Date | number | string,
  endDate: Date | number | string
): boolean => {
  const d = toDate(date).getTime();
  return d >= toDate(startDate).getTime() && d <= toDate(endDate).getTime();
};

// Check if selected day is in previous month relative to given month/year
export const isSelectedDayInPreviousMonth = (
  date: Date | number | string,
  month: number,
  year: number
): boolean => {
  const inputDate = toDate(date);
  const packedPrev = getPreviousMonth(month, year);
  const { month: prevMonth, year: prevYear } = unpackMonthYear(packedPrev);
  return (
    inputDate.getMonth() === prevMonth &&
    inputDate.getFullYear() === prevYear
  );
};

// Check if selected day is in next month relative to given month/year
export const isSelectedDayInNextMonth = (
  date: Date | number | string,
  month: number,
  year: number
): boolean => {
  const inputDate = toDate(date);
  const packedNext = getNextMonth(month, year);
  const { month: nextMonth, year: nextYear } = unpackMonthYear(packedNext);
  return (
    inputDate.getMonth() === nextMonth &&
    inputDate.getFullYear() === nextYear
  );
};

// Optimized date validation
export const isValidDate = (date: Date | string | number): boolean => {
  return !isNaN(toDate(date).getTime());
};
