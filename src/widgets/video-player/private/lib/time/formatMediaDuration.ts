import memoizee from "memoizee";
import { TimeConstants } from "./TimeConstants";
import {
  calculateTimeComponents,
  shouldIncludeDays,
  shouldIncludeHours,
  formatTimeSegment,
  FormatOptions as BaseFormatOptions,
} from "./TimeHelpers";

interface FormatOptions extends BaseFormatOptions {
  includeMilliseconds?: boolean;   // Include milliseconds (e.g., "01:23.456")
  minimal?: boolean;               // Use minimal format for short durations (e.g., "5s")
}

export const formatMediaDuration = (
  duration: number,
  options: FormatOptions = {},
): string => {
  if (!Number.isFinite(duration) || duration < 0) {
    return TimeConstants.DEFAULT_TIME_STRING; // e.g., "00:00"
  }

  const {
    maxValue,
    includeHours = false,
    includeDays = false,
    forceTwoDigits = false,
    includeMilliseconds = false,
    separator = ":",
    minimal = false,
    pattern,
  } = options;

  const components = calculateTimeComponents(duration);
  const { days, hours, minutes, seconds, milliseconds } = components;

  // Minimal format for short durations (e.g., "5s" for 5 seconds)
  if (minimal && days === 0 && hours === 0 && minutes === 0 && !includeMilliseconds) {
    return `${seconds}s`;
  }

  if (pattern) {
    let result = pattern;
    result = result.replace("d", formatTimeSegment(days, forceTwoDigits));
    result = result.replace("h", formatTimeSegment(hours, forceTwoDigits));
    result = result.replace("m", formatTimeSegment(minutes, forceTwoDigits));
    result = result.replace("s", formatTimeSegment(seconds, forceTwoDigits));
    if (includeMilliseconds && milliseconds !== undefined) {
      result = result.replace("ms", String(milliseconds).padStart(3, "0"));
    }
    return result;
  }

  const segments: string[] = [];
  const hasDays = shouldIncludeDays(components, { includeDays, maxValue });
  const hasHours = hasDays || shouldIncludeHours(components, { includeHours, maxValue });

  if (hasDays) {
    segments.push(formatTimeSegment(days, forceTwoDigits || true));
  }

  if (hasHours) {
    segments.push(formatTimeSegment(hours, forceTwoDigits || hasDays));
  }

  const maxMinutes = maxValue
    ? Math.floor((maxValue % TimeConstants.SECONDS_IN_HOUR) / TimeConstants.SECONDS_IN_MINUTE)
    : 0;
  const forceMinutesDigits =
    forceTwoDigits || hasHours || maxMinutes >= TimeConstants.MIN_TWO_DIGITS;

  segments.push(formatTimeSegment(minutes, forceMinutesDigits));
  segments.push(formatTimeSegment(seconds, forceTwoDigits || true));

  if (includeMilliseconds && milliseconds !== undefined) {
    segments.push(String(milliseconds).padStart(3, "0"));
  }

  return segments.join(separator);
};

export const memoizedFormatMediaDuration = memoizee(formatMediaDuration);

