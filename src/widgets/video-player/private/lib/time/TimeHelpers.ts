import { round } from "@/lib/core";
import { TimeConstants } from "./TimeConstants";

interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FormatOptions {
  maxValue?: number;
  includeHours?: boolean;
  includeDays?: boolean;
  forceTwoDigits?: boolean;
}

const calculateTimeComponents = (duration: number): TimeComponents => {
  const days = Math.floor(duration / TimeConstants.SECONDS_IN_DAY);
  const remainingAfterDays = duration % TimeConstants.SECONDS_IN_DAY;

  const hours = Math.floor(remainingAfterDays / TimeConstants.SECONDS_IN_HOUR);
  const remainingAfterHours =
    remainingAfterDays % TimeConstants.SECONDS_IN_HOUR;

  const minutes = Math.floor(
    remainingAfterHours / TimeConstants.SECONDS_IN_MINUTE,
  );
  const seconds = remainingAfterHours % TimeConstants.SECONDS_IN_MINUTE;

  return { days, hours, minutes, seconds };
};

const shouldIncludeDays = (
  components: TimeComponents,
  options: FormatOptions,
): boolean => {
  const maxDays = options.maxValue
    ? Math.floor(options.maxValue / TimeConstants.SECONDS_IN_DAY)
    : 0;

  return Boolean(options.includeDays || components.days > 0 || maxDays > 0);
};

const shouldIncludeHours = (
  components: TimeComponents,
  options: FormatOptions,
): boolean => {
  const maxHours = options.maxValue
    ? Math.floor(
        (options.maxValue % TimeConstants.SECONDS_IN_DAY) /
          TimeConstants.SECONDS_IN_HOUR,
      )
    : 0;

  return Boolean(options.includeHours || components.hours > 0 || maxHours > 0);
};

const formatTimeSegment = (value: number, forceTwoDigits: boolean): string => {
  const shouldPad = forceTwoDigits || value >= TimeConstants.MIN_TWO_DIGITS;
  const normalizedValue = round(value);

  return shouldPad
    ? String(normalizedValue).padStart(
        TimeConstants.PAD_START_LENGTH,
        TimeConstants.PAD_STRING,
      )
    : String(normalizedValue);
};

export {
  type TimeComponents,
  type FormatOptions,
  calculateTimeComponents,
  shouldIncludeDays,
  shouldIncludeHours,
  formatTimeSegment,
};
