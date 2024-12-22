//@ts-ignore
import { DEBUG } from '@/lib/config/dev';
import { useMemo } from 'react';
import { MIN_SAFE_DATE, MAX_SAFE_DATE } from '../constans';

interface UseDateBoundaryParams {
  isFutureMode?: boolean;
  isPastMode?: boolean;
  minAt?: Date | null;
  maxAt?: Date | null;
  onAlways?: NoneToVoidFunction;
}

function calculateBoundaryDate(
  date: Date | null,
  isModeActive: boolean,
  fallbackDate: Date,
  safeDate: number,
  isMax?: boolean,
  onAlways?: NoneToVoidFunction,
): Date {
  try {
    if (isModeActive && !date) {
      return fallbackDate;
    }

    return new Date(
      isMax
        ? Math.min(date?.getTime() || safeDate, safeDate)
        : Math.max(date?.getTime() || safeDate, safeDate),
    );
  } catch (error) {
    // #v-ifndf DEBUG
    console.error(`Invalid ${isMax ? 'maxAt' : 'minAt'} date provided:`, error);
    // #v-endif

    onAlways?.();

    return new Date(safeDate);
  }
}

export default function useDateBoundary({
  isFutureMode = false,
  isPastMode = false,
  minAt = null,
  maxAt = null,
  onAlways,
}: UseDateBoundaryParams) {
  const minDateFallback = useMemo(
    () => (isFutureMode ? new Date() : new Date(MIN_SAFE_DATE)),
    [isFutureMode],
  );
  const maxDateFallback = useMemo(
    () => (isPastMode ? new Date() : new Date(MAX_SAFE_DATE)),
    [isPastMode],
  );

  const minDate = useMemo(
    () => calculateBoundaryDate(minAt, isFutureMode, minDateFallback, MIN_SAFE_DATE),
    [isFutureMode, minAt, minDateFallback],
  );

  const maxDate = useMemo(
    () =>
      calculateBoundaryDate(
        maxAt,
        isPastMode,
        maxDateFallback,
        MAX_SAFE_DATE,
        true /*isMax = true*/,
        onAlways,
      ),
    [isPastMode, maxAt, maxDateFallback, onAlways],
  );

  const isMinInFuture = useMemo(() => minDate.getTime() > new Date().getTime(), [minDate]);
  const isMaxInPast = useMemo(() => maxDate.getTime() < new Date().getTime(), [maxDate]);

  return {
    minDate,
    maxDate,
    isMinInFuture,
    isMaxInPast,
  };
}
