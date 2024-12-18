import { useState } from 'react';
import { ZoomLevel } from '../constans';

const useZoomLevel = () => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.WEEK);

  const switchZoomLevel = (level?: ZoomLevel) => {
    if (level) {
      setZoomLevel(level);
    } else {
      const levels = [ZoomLevel.WEEK, ZoomLevel.MONTH, ZoomLevel.YEAR];
      setZoomLevel(prev => levels[(prev + 1) % levels.length]);
    }
  };

  return { zoomLevel, switchZoomLevel };
};

export default useZoomLevel;
