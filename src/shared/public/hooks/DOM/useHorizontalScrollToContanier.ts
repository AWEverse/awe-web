import { useEffect } from "react";
import animateHorizontalScroll from "@/lib/utils/animation/animateHorizontalScroll";
import { IS_IOS, IS_ANDROID } from "@/lib/core";
import { requestMeasure } from "@/lib/modules/fastdom";

const TAB_SCROLL_THRESHOLD_PX = 18;
const BASE_SCROLL_DURATION = IS_IOS ? 450 : IS_ANDROID ? 400 : 300; // Base duration in ms
const DURATION_PER_PIXEL = 0.1; // Additional ms per pixel of scroll distance
const MIN_DAMPING = 4; // Minimum damping for quick scrolls
const MAX_DAMPING = 8; // Maximum damping for smooth, long scrolls

const useHorizontalScrollToContainer = (
  containerRef: React.RefObject<HTMLElement | null>,
  activeEl: number
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestMeasure(() => {
      const { scrollWidth, offsetWidth, scrollLeft } = container;

      if (scrollWidth <= offsetWidth) {
        return;
      }

      const activeElement = container.childNodes[activeEl] as HTMLElement | null;
      if (!activeElement) return;

      const { offsetLeft: activeElOffsetLeft, offsetWidth: activeElOffsetWidth } = activeElement;

      const newLeft = activeElOffsetLeft - offsetWidth / 2 + activeElOffsetWidth / 2;
      const scrollDistance = Math.abs(newLeft - scrollLeft);

      if (scrollDistance < TAB_SCROLL_THRESHOLD_PX) {
        return;
      }

      const duration = BASE_SCROLL_DURATION + scrollDistance * DURATION_PER_PIXEL;

      const damping =
        MIN_DAMPING + (MAX_DAMPING - MIN_DAMPING) * (scrollDistance / scrollWidth);

      animateHorizontalScroll(container, newLeft, {
        duration,
        damping,
      });
    });
  }, [activeEl, containerRef]);
};

export default useHorizontalScrollToContainer;
