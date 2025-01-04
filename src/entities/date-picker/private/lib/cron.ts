const CRON_DATE_FORMAT = '59 23 31 12 9999'; // Длина: 19 символов

export type CronDateRegex =
  '^([0-5]?d)s([01]?d|2[0-3])s([01]?d|2[0-9]|3[01])s([1-9]|1[0-2])s([0-7])$';

// * * * * * выполняемая команда
// - - - - -
// | | | | |
// | | | | ----- день недели (0—7) (воскресенье = 0 или 7)
// | | | ------- месяц (1—12)
// | | --------- день месяца (1—31)
// | ----------- час (0—23)
// ------------- минута (0—59)
export const parseDateCommand = (cmnd: string) => {
  if (CRON_DATE_FORMAT.length < cmnd.length) throw new Error('Cron expression is too long.');
  if (!cmnd) throw new Error('Cron expression is required.');

  const [minutes, hours, days, months, years] = cmnd.split(' ');

  // Helper function to check if a field is '*' (wildcard)
  const isWildcard = (value: string) => value === '*';

  const isInRange = (value: string, min: number, max: number): boolean => {
    const num = +value;
    return /^\d+$/.test(value) && num >= min && num <= max;
  };

  if (!isWildcard(minutes) && !isInRange(minutes, 0, 59)) {
    throw new Error("Invalid minute value. Must be between 0 and 59 or '*'.");
  }

  if (!isWildcard(hours) && !isInRange(hours, 0, 23)) {
    throw new Error("Invalid hour value. Must be between 0 and 23 or '*'.");
  }

  if (!isWildcard(months) && !isInRange(months, 1, 12)) {
    throw new Error("Invalid month value. Must be between 1 and 12 or '*'.");
  }

  if (!isWildcard(days) && !isInRange(days, 1, 31)) {
    throw new Error("Invalid day value. Must be between 1 and 31 or '*'.");
  }

  if (!/^\d{4}$/.test(years) || +years < 1000) {
    throw new Error('Invalid year value. Must be a valid 4-digit year.');
  }

  if (!isWildcard(days)) {
    const monthIndex = +months - 1;
    const day = +days;
    const date = new Date(+years, monthIndex, day);

    if (date.getMonth() !== monthIndex || date.getDate() !== day) {
      throw new Error(`Invalid day for the given month/year: ${days}-${months}-${years}.`);
    }
  }

  const finalMinutes = isWildcard(minutes) ? 0 : +minutes;
  const finalHours = isWildcard(hours) ? 0 : +hours;
  const finalDays = isWildcard(days) ? 1 : +days;
  const finalMonths = isWildcard(months) ? 0 : +months - 1;
  const finalYears = +years;

  return new Date(finalYears, finalMonths, finalDays, finalHours, finalMinutes);
};
