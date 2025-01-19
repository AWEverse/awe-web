import { useEffect } from 'react';

const usePreventZoom = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if the Ctrl key is pressed
      if (e.ctrlKey) {
        e.preventDefault(); // Prevent zooming
      }
    };

    const currentElement = ref.current;
    if (currentElement) {
      currentElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [ref]);
};

export default usePreventZoom;
