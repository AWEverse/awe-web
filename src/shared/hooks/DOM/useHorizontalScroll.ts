import { useEffect } from 'react';

const useHorizontalScroll = (
  containerRef: React.RefObject<HTMLElement | null>,
  isDisabled?: boolean,
  shouldPreventDefault = false,
) => {
  useEffect(() => {
    if (isDisabled) {
      return undefined;
    }

    const container = containerRef.current!;

    const handleScroll = (e: WheelEvent) => {
      if (e.deltaX !== 0) return;

      if (container) {
        container.scrollLeft += e.deltaY;

        if (shouldPreventDefault) {
          e.preventDefault();
        }
      }
    };

    container.addEventListener('wheel', handleScroll, { passive: !shouldPreventDefault });

    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [containerRef, isDisabled, shouldPreventDefault]);
};

export default useHorizontalScroll;
