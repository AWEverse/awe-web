import { useEffect } from 'react';
import animateHorizontalScroll from '@/lib/utils/animation/animateHorizontalScroll';
import { IS_IOS, IS_ANDROID } from '@/lib/utils/OS/windowEnviroment';
import { requestMeasure } from '@/lib/modules/fastdom/fastdom';

const TAB_SCROLL_THRESHOLD_PX = 18;
// Should match duration from `--slide-transition` CSS variable
const SCROLL_DURATION = IS_IOS ? 450 : IS_ANDROID ? 400 : 300;

const useHorizontalScrollToContanier = (
  containerRef: React.RefObject<HTMLElement | null>,
  activeTab: number,
) => {
  useEffect(() => {
    const container = containerRef.current!;

    requestMeasure(() => {
      const { scrollWidth, offsetWidth, scrollLeft } = container;
      if (scrollWidth <= offsetWidth) {
        return;
      }

      const activeTabElement = container.childNodes[activeTab] as HTMLElement | null;
      if (!activeTabElement) {
        return;
      }

      const { offsetLeft: activeTabOffsetLeft, offsetWidth: activeTabOffsetWidth } =
        activeTabElement;
      const newLeft = activeTabOffsetLeft - offsetWidth / 2 + activeTabOffsetWidth / 2;

      // Prevent scrolling by only a couple of pixels, which doesn't look smooth
      if (Math.abs(newLeft - scrollLeft) < TAB_SCROLL_THRESHOLD_PX) {
        return;
      }

      animateHorizontalScroll(container, newLeft, SCROLL_DURATION);
    });
  }, [activeTab]);
};

export default useHorizontalScrollToContanier;
