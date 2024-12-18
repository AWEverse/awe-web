import { useEffect } from 'react';

const useHorizontalScroll = (
  containerRef: React.RefObject<HTMLDivElement>,
  isDisabled?: boolean,
  shouldPreventDefault = false,
) => {
  useEffect(() => {
    if (isDisabled) {
      return undefined;
    }

    const container = containerRef.current!;

    function handleScroll(e: WheelEvent) {
      if (e.deltaX !== 0) return;

      const containerRef = container;

      if (containerRef) {
        containerRef.scrollLeft += e.deltaY;

        if (shouldPreventDefault) {
          e.preventDefault();
        }
      }
    }

    container.addEventListener('wheel', handleScroll, { passive: !shouldPreventDefault });

    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [containerRef, isDisabled, shouldPreventDefault]);
};

export default useHorizontalScroll;
