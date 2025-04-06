import { round } from "@/lib/core";
import { TimeConstants } from "./TimeConstants";
import memoizee from "memoizee";

interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds?: number;
}

interface FormatOptions {
  maxValue?: number;           // Max duration to determine format inclusion
  includeHours?: boolean;      // Force hours even if 0
  includeDays?: boolean;       // Force days even if 0
  forceTwoDigits?: boolean;    // Pad all segments to 2 digits
  includeMilliseconds?: boolean; // Include milliseconds in output
  separator?: string;          // Custom separator (default: ":")
  pattern?: string;           // Custom pattern (e.g., "d:h:m:s")
}

const calculateTimeComponents = (duration: number): TimeComponents => {
  if (!Number.isFinite(duration) || duration < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
  }

  const totalSeconds = Math.abs(round(duration));
  const days = Math.floor(totalSeconds / TimeConstants.SECONDS_IN_DAY);
  const remainingAfterDays = totalSeconds % TimeConstants.SECONDS_IN_DAY;

  const hours = Math.floor(remainingAfterDays / TimeConstants.SECONDS_IN_HOUR);
  const remainingAfterHours = remainingAfterDays % TimeConstants.SECONDS_IN_HOUR;

  const minutes = Math.floor(remainingAfterHours / TimeConstants.SECONDS_IN_MINUTE);
  const seconds = remainingAfterHours % TimeConstants.SECONDS_IN_MINUTE;

  const milliseconds = Math.round((duration % 1) * 1000);

  return { days, hours, minutes, seconds, milliseconds };
};

const toSeconds = (components: TimeComponents): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = components;
  return (
    days * TimeConstants.SECONDS_IN_DAY +
    hours * TimeConstants.SECONDS_IN_HOUR +
    minutes * TimeConstants.SECONDS_IN_MINUTE +
    seconds +
    milliseconds / 1000
  );
};

const shouldIncludeDays = (components: TimeComponents, options: FormatOptions): boolean => {
  const maxDays = options.maxValue
    ? Math.floor(options.maxValue / TimeConstants.SECONDS_IN_DAY)
    : 0;
  return options.includeDays || components.days > 0 || maxDays > 0;
};

const shouldIncludeHours = (components: TimeComponents, options: FormatOptions): boolean => {
  const maxHours = options.maxValue
    ? Math.floor((options.maxValue % TimeConstants.SECONDS_IN_DAY) / TimeConstants.SECONDS_IN_HOUR)
    : 0;
  return options.includeHours || components.hours > 0 || maxHours > 0 || shouldIncludeDays(components, options);
};

const formatTimeSegment = (value: number, forceTwoDigits: boolean): string => {
  const normalizedValue = Math.max(0, round(value)); // Ensure non-negative
  const shouldPad = forceTwoDigits || normalizedValue >= TimeConstants.MIN_TWO_DIGITS;
  return shouldPad
    ? String(normalizedValue).padStart(TimeConstants.PAD_START_LENGTH, TimeConstants.PAD_STRING)
    : String(normalizedValue);
};

const formatTime = (duration: number, options: Partial<FormatOptions> = {}): string => {
  const {
    maxValue,
    includeHours = false,
    includeDays = false,
    forceTwoDigits = false,
    includeMilliseconds = false,
    separator = ":",
    pattern,
  } = options;

  const components = calculateTimeComponents(duration);
  const { days, hours, minutes, seconds, milliseconds } = components;

  const parts: string[] = [];
  const includeD = shouldIncludeDays(components, { includeDays, maxValue });
  const includeH = shouldIncludeHours(components, { includeHours, maxValue, includeDays });

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

  if (includeD) {
    parts.push(formatTimeSegment(days, forceTwoDigits));
  }
  if (includeH) {
    parts.push(formatTimeSegment(hours, forceTwoDigits));
  }
  parts.push(formatTimeSegment(minutes, forceTwoDigits));
  parts.push(formatTimeSegment(seconds, forceTwoDigits));

  if (includeMilliseconds && milliseconds !== undefined) {
    parts.push(String(milliseconds).padStart(3, "0"));
  }

  return parts.join(separator);
};

const memoizedFormatTime = memoizee(formatTime);

export {
  type TimeComponents,
  type FormatOptions,
  calculateTimeComponents,
  toSeconds,
  shouldIncludeDays,
  shouldIncludeHours,
  formatTimeSegment,
  formatTime,
  memoizedFormatTime,
};
