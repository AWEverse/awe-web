import buildClassName from '@/shared/lib/buildClassName';
import buildStyle from '@/shared/lib/buildStyle';
import { useMemo } from 'react';
import { ZoomLevel } from '../constans';

const useCalendarStyles = (zoomLevel: ZoomLevel, cellSize: number) => {
  const className = useMemo(
    () => buildClassName('calendarGrid', `${String(ZoomLevel[zoomLevel]).toLowerCase()}View`),
    [zoomLevel],
  );

  const style = useMemo(() => buildStyle(`--cell-size: ${cellSize}px`), [cellSize]);

  return { className, style };
};

export default useCalendarStyles;
