import { useMemo } from 'react';
import { MIN_SAFE_DATE, MAX_SAFE_DATE } from '../constans';

interface UseDateRangeProps {
  minAt?: number;
  maxAt?: number;
  isFutureMode?: boolean;
  isPastMode?: boolean;
}

export default function useDateRange({ isFutureMode, isPastMode, minAt, maxAt }: UseDateRangeProps) {
  return useMemo(() => {
    const defaultMinDate = isFutureMode ? Date.now() : MIN_SAFE_DATE;
    const defaultMaxDate = isPastMode ? Date.now() : MAX_SAFE_DATE;

    return {
      minDate: new Date(Math.max(minAt ?? defaultMinDate, MIN_SAFE_DATE)),
      maxDate: new Date(Math.min(maxAt ?? defaultMaxDate, MAX_SAFE_DATE)),
    };
  }, [isFutureMode, isPastMode, minAt, maxAt]);
}
