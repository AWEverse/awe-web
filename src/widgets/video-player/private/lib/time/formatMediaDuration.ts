import { TimeConstants } from "./TimeConstants";
import {
  calculateTimeComponents,
  shouldIncludeDays,
  shouldIncludeHours,
  formatTimeSegment,
  FormatOptions,
} from "./TimeHelpers";

export const formatMediaDuration = (
  duration: number,
  options: FormatOptions = {},
): string => {
  if (duration < 0 || Number.isNaN(duration)) {
    return TimeConstants.DEFAULT_TIME_STRING;
  }

  const components = calculateTimeComponents(duration);
  const includeDays = shouldIncludeDays(components, options);
  const includeHours = includeDays || shouldIncludeHours(components, options);

  const segments: string[] = [];

  if (includeDays) {
    segments.push(formatTimeSegment(components.days, true));
  }

  if (includeDays || includeHours) {
    segments.push(formatTimeSegment(components.hours, includeDays));
  }

  const forceMinutesDigits =
    includeHours ||
    (options.maxValue
      ? Math.floor(
          (options.maxValue % TimeConstants.SECONDS_IN_HOUR) /
            TimeConstants.SECONDS_IN_MINUTE,
        ) >= TimeConstants.MIN_TWO_DIGITS
      : false) ||
    options.forceTwoDigits;

  segments.push(
    formatTimeSegment(components.minutes, !!forceMinutesDigits),
    formatTimeSegment(components.seconds, true),
  );

  return segments.join(":");
};
