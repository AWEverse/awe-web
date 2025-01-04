import { useMemo } from 'react';
import { MAX_SAFE_DATE, MIN_SAFE_DATE } from '../constans';

interface UseIsDateDisabledParams {
  selectedDate: Date;
  isFutureMode?: boolean;
  isPastMode?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export default function useIsDateDisabled({
  selectedDate,
  isFutureMode = false,
  isPastMode = false,
  minDate = new Date(MIN_SAFE_DATE),
  maxDate = new Date(MAX_SAFE_DATE),
}: UseIsDateDisabledParams) {
  const isDisabled = useMemo(() => {
    return (
      (isFutureMode && selectedDate.getTime() < minDate.getTime()) ||
      (isPastMode && selectedDate.getTime() > maxDate.getTime())
    );
  }, [selectedDate, isFutureMode, isPastMode, minDate, maxDate]);

  return isDisabled;
}
