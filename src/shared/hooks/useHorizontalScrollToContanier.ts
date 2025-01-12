import { useEffect, useMemo } from 'react';
import animateHorizontalScroll from '@/lib/utils/animation/animateHorizontalScroll';
import { IS_IOS, IS_ANDROID } from '@/lib/core';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

const TAB_SCROLL_THRESHOLD_PX = 18;
const SCROLL_DURATION = IS_IOS ? 450 : IS_ANDROID ? 400 : 300;

const useHorizontalScrollToContanier = (
  containerRef: React.RefObject<HTMLElement | null>,
  activeTab: number,
) => {
  const containerDimensions = useMemo(() => {
    const container = containerRef.current!;

    return {
      scrollWidth: container.scrollWidth,
      offsetWidth: container.offsetWidth,
      scrollLeft: container.scrollLeft,
    };
  }, [containerRef.current]);

  useEffect(() => {
    const container = containerRef.current!;

    requestMeasure(() => {
      const { scrollWidth, offsetWidth, scrollLeft } = containerDimensions;

      if (scrollWidth <= offsetWidth) {
        return;
      }

      const activeTabElement = container.childNodes[activeTab] as HTMLElement | null;

      if (activeTabElement) {
        const { offsetLeft: activeTabOffsetLeft, offsetWidth: activeTabOffsetWidth } =
          activeTabElement;

        const newLeft = activeTabOffsetLeft - offsetWidth / 2 + activeTabOffsetWidth / 2;

        if (Math.abs(newLeft - scrollLeft) < TAB_SCROLL_THRESHOLD_PX) {
          return;
        }

        // Perform the scroll with optimized duration and throttled animations
        animateHorizontalScroll(container, newLeft, SCROLL_DURATION);
      }
    });
  }, [activeTab, containerDimensions]);
};

export default useHorizontalScrollToContanier;
