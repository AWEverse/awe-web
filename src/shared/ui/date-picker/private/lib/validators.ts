// Utility to convert input to Date if not already a Date
const toDate = (date: Date | number): Date => (date instanceof Date ? date : new Date(date));

// Utility to compare two dates (ignores time)
const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

// Utility to compare if two months and years are the same (ignores the day)
const isSameMonth = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();

// Utility to get the previous month (handles year overflow)
const getPreviousMonth = (month: number, year: number): { month: number; year: number } => {
  return month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year };
};

// Utility to get the next month (handles year overflow)
const getNextMonth = (month: number, year: number): { month: number; year: number } => {
  return month === 11 ? { month: 0, year: year + 1 } : { month: month + 1, year };
};

// Check if the given date is today
export const isCurrentDay = (date: Date | number): boolean => {
  const today = new Date();
  return isSameDay(toDate(date), today);
};

// Check if the given date is in the current month
export const isCurrentMonth = (date: Date | number): boolean => {
  const today = new Date();
  return isSameMonth(toDate(date), today);
};

// Main function to check if the date is in the previous month
export const isPreviousMonth = (date: Date | number): boolean => {
  const today = new Date();
  const { month: prevMonth, year: prevYear } = getPreviousMonth(
    today.getMonth(),
    today.getFullYear(),
  );

  const inputDate = typeof date === 'number' ? new Date(date) : date;

  return inputDate.getMonth() === prevMonth && inputDate.getFullYear() === prevYear;
};

// Check if the given date is in the current year
export const isCurrentYear = (date: Date | number): boolean => {
  const today = new Date();
  return toDate(date).getFullYear() === today.getFullYear();
};

// Check if the given date is in a specific range
export const isDateInRange = (
  date: Date | number,
  startDate: Date | number,
  endDate: Date | number,
): boolean => {
  const inputDate = toDate(date);
  const start = toDate(startDate);
  const end = toDate(endDate);
  return inputDate >= start && inputDate <= end;
};

// Check if the selected day is in the previous month
export const isSelectedDayInPreviousMonth = (
  date: Date | number,
  month: number,
  year: number,
): boolean => {
  const inputDate = toDate(date);
  const { month: prevMonth, year: prevYear } = getPreviousMonth(month, year);
  return inputDate.getMonth() === prevMonth && inputDate.getFullYear() === prevYear;
};

// Check if the selected day is in the next month
export const isSelectedDayInNextMonth = (
  date: Date | number,
  month: number,
  year: number,
): boolean => {
  const inputDate = toDate(date);
  const { month: nextMonth, year: nextYear } = getNextMonth(month, year);
  return inputDate.getMonth() === nextMonth && inputDate.getFullYear() === nextYear;
};

export const isValidDate = (date: Date | string | number): boolean => {
  const parsedDate = date instanceof Date ? date : new Date(date);

  return !isNaN(parsedDate.getTime());
};
