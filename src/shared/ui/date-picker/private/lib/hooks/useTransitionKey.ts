import { useMemo } from 'react';

const useTransitionKey = (direction: { current: string }, zoomLevel: number, currentDate: Date) => {
  return useMemo(() => {
    if (direction.current === 'zoomIn') {
      return zoomLevel * 2;
    }
    return currentDate.getTime().toString();
  }, [direction.current, zoomLevel, currentDate]);
};

export default useTransitionKey;
