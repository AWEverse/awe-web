const HOUR_IN_SECONDS = 3600;
const MINUTE_IN_SECONDS = 60;

export function formatMediaDuration(
  duration: number,
  options?: {
    maxValue?: number;
    includeHours?: boolean;
    forceTwoDigits?: boolean;
  },
) {
  if (duration < 0 || isNaN(duration)) {
    return '00:00';
  }

  const { maxValue = 0, includeHours = false, forceTwoDigits = false } = options || {};

  const hours = Math.floor(duration / HOUR_IN_SECONDS);
  const minutes = Math.floor((duration % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS);
  const seconds = Math.floor((duration % HOUR_IN_SECONDS) % MINUTE_IN_SECONDS);

  const maxHours = maxValue ? Math.floor(maxValue / HOUR_IN_SECONDS) : 0;
  const maxMinutes = maxValue ? Math.floor((maxValue % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS) : 0;

  const shouldIncludeHours = includeHours || hours > 0 || maxHours > 0;
  const forceMinutesTwoDigits = shouldIncludeHours || maxMinutes >= 10 || forceTwoDigits;

  let timeString = '';

  if (shouldIncludeHours) {
    timeString += `${String(hours).padStart(2, '0')}:`;
  }

  timeString += `${forceMinutesTwoDigits ? String(minutes).padStart(2, '0') : String(minutes)}:`;
  timeString += String(seconds).padStart(2, '0');

  return timeString;
}

export const getPageX = (e: MouseEvent | TouchEvent | PointerEvent): number => {
  if (window.PointerEvent && e instanceof PointerEvent) {
    return e.pageX || 0;
  }

  if (e instanceof MouseEvent) {
    return e.pageX || 0;
  }

  if (e instanceof TouchEvent && e.touches?.[0]) {
    return e.touches[0].pageX || 0;
  }

  return 0;
};
