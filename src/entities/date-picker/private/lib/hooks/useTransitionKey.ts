import { useMemo } from 'react';

const useTransitionKey = (direction: string, zoomLevel: number, currentDate: Date) => {
  return useMemo(() => {
    if (direction === 'zoomIn') {
      return zoomLevel * 2;
    }
    return currentDate.getTime().toString();
  }, [direction, zoomLevel, currentDate]);
};

export default useTransitionKey;
