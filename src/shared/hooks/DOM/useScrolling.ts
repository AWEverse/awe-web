import { RefObject, useEffect, useRef } from "react";
import { off, on } from "../../../lib/utils/listener";

type ScrollDirection = "up" | "down";

interface UseScrollingOptions {
  debounce?: number;
  onScrollEnd?: NoneToVoidFunction;
  onScroll?: (direction: ScrollDirection) => void;
  onScrollStart?: NoneToVoidFunction;
}

const useScrolling = (
  ref: RefObject<HTMLElement>,
  options: UseScrollingOptions = {},
): void => {
  const {
    debounce = 300,
    onScrollEnd = () => {},
    onScroll = () => {},
    onScrollStart = () => {},
  } = options;

  const lastScrollTop = useRef<number>(0);
  const scrollingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentRef = ref.current;

    if (currentRef) {
      const handleScroll = () => {
        const currentScrollTop = currentRef.scrollTop;

        if (scrollingTimeout.current) {
          clearTimeout(scrollingTimeout.current);
        }

        if (currentScrollTop > lastScrollTop.current) {
          onScroll("down");
        } else if (currentScrollTop < lastScrollTop.current) {
          onScroll("up");
        }

        lastScrollTop.current = currentScrollTop;

        scrollingTimeout.current = setTimeout(() => {
          onScrollEnd();
        }, debounce);

        onScrollStart();
      };

      on(currentRef, "scroll", handleScroll, false);

      return () => {
        off(currentRef, "scroll", handleScroll, false);
        if (scrollingTimeout.current) {
          clearTimeout(scrollingTimeout.current);
        }
      };
    }
  }, [debounce, ref, onScrollEnd, onScroll, onScrollStart]);
};

export default useScrolling;
