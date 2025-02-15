import { useEffect } from "react";
import animateHorizontalScroll from "@/lib/utils/animation/animateHorizontalScroll";
import { IS_IOS, IS_ANDROID } from "@/lib/core";
import { requestMeasure } from "@/lib/modules/fastdom/fastdom";

const TAB_SCROLL_THRESHOLD_PX = 18;
const SCROLL_DURATION = IS_IOS ? 450 : IS_ANDROID ? 400 : 300;

const useHorizontalScrollToContanier = (
  containerRef: React.RefObject<HTMLElement | null>,
  activeEl: number,
) => {
  useEffect(() => {
    const container = containerRef.current!;

    requestMeasure(() => {
      const { scrollWidth, offsetWidth, scrollLeft } = container;

      if (scrollWidth <= offsetWidth) {
        return;
      }

      const activeElement = container.childNodes[
        activeEl
      ] as HTMLElement | null;

      if (activeElement) {
        const {
          offsetLeft: activeElOffsetLeft,
          offsetWidth: activeElOffsetWidth,
        } = activeElement;

        const newLeft =
          activeElOffsetLeft - offsetWidth / 2 + activeElOffsetWidth / 2;

        if (Math.abs(newLeft - scrollLeft) < TAB_SCROLL_THRESHOLD_PX) {
          return;
        }

        // Perform the scroll with optimized duration and throttled animations
        animateHorizontalScroll(container, newLeft, {
          duration: SCROLL_DURATION,
          damping: 6,
        });
      }
    });
  }, [activeEl]);
};

export default useHorizontalScrollToContanier;
