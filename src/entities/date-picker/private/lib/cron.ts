
export type CronDateRegex =
  '^([0-5]?[0-9])\\s([01]?[0-9]|2[0-3])\\s([0-2]?[0-9]|3[0-1])\\s([1-9]|1[0-2])\\s(\\d{4})$';

const validateCronFormat = (cmnd: string): boolean => {
  const regex = /^([0-5]?[0-9])\s([01]?[0-9]|2[0-3])\s([0-2]?[0-9]|3[0-1])\s([1-9]|1[0-2])\s(\d{4})$/;
  return regex.test(cmnd);
};

const isInRange = (value: string, min: number, max: number): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
};

const isValidDay = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month, day);
  return date.getMonth() === month && date.getDate() === day;
};

export const parseDateCommand = (cmnd: string): Date => {
  if (!cmnd || cmnd.length > 19) {
    throw new Error('Invalid cron expression format or length exceeds 19 characters.');
  }

  if (!validateCronFormat(cmnd)) {
    throw new Error('Cron expression format is invalid. Expected: "minutes hours days months years"');
  }

  const [minutes, hours, days, months, years] = cmnd.split(' ').map(Number);

  if (!isInRange(minutes.toString(), 0, 59)) {
    throw new Error(`Invalid minute value: ${minutes}. Must be between 0-59.`);
  }

  if (!isInRange(hours.toString(), 0, 23)) {
    throw new Error(`Invalid hour value: ${hours}. Must be between 0-23.`);
  }

  if (!isInRange(months.toString(), 1, 12)) {
    throw new Error(`Invalid month value: ${months}. Must be between 1-12.`);
  }

  if (!isInRange(days.toString(), 1, 31)) {
    throw new Error(`Invalid day value: ${days}. Must be between 1-31.`);
  }

  if (!isInRange(years.toString(), 1000, 9999)) {
    throw new Error(`Invalid year value: ${years}. Must be a 4-digit year between 1000-9999.`);
  }

  if (!isValidDay(years, months - 1, days)) {
    throw new Error(`Invalid date: ${days}-${months}-${years}.`);
  }

  return new Date(years, months - 1, days, hours, minutes);
};
