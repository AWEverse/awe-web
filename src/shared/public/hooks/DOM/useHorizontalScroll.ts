import { useEffect } from "react";

interface UseHorizontalScrollOptions {
  isDisabled?: boolean;
  shouldPreventDefault?: boolean;
  scrollSpeedMultiplier?: number;
}

const useHorizontalScroll = (
  containerRef: React.RefObject<HTMLElement | null>,
  {
    isDisabled = false,
    shouldPreventDefault = false,
    scrollSpeedMultiplier = 1,
  }: UseHorizontalScrollOptions = {},
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (isDisabled || !container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0) return;

      container.scrollLeft += event.deltaY * scrollSpeedMultiplier;

      if (shouldPreventDefault) {
        event.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, {
      passive: !shouldPreventDefault,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, isDisabled, shouldPreventDefault, scrollSpeedMultiplier]);
};

export default useHorizontalScroll;
