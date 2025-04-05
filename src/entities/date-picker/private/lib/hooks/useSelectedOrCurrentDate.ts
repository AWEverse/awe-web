import { useMemo } from 'react';
import { isValidDate } from '../validators';

export default function useSelectedOrCurrentDate(selectedAt?: number | string | Date) {
  return useMemo(() => {
    const selectedDate = new Date(selectedAt ?? Date.now());

    return isValidDate(selectedDate) ? selectedDate : new Date();
  }, [selectedAt]);
}
