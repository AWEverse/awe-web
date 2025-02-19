import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  useCallback,
} from "react";
import {
  requestMutation,
  requestMeasure,
  requestNextMutation,
} from "@/lib/modules/fastdom";
import { useDebouncedFunction } from "../shedulers";
import useWindowSize from "@/shared/hooks/DOM/useWindowSize";
import { useStableCallback } from "../base";

const WINDOW_RESIZE_LINE_RECALC_DEBOUNCE = 200;

//
// Helper: Calculates the line height and total number of lines in the container.
//

/*
* Measure only
*/
export function calcTextLineHeightAndCount(textContainer: HTMLElement) {
  const computedStyle = getComputedStyle(textContainer);
  // Parse the computed line height (assuming it’s in pixels)
  const lineHeight = parseInt(computedStyle.lineHeight, 10);
  // Divide the total scroll height by the line height to estimate the number of lines
  const totalLines = textContainer.scrollHeight / lineHeight;
  return { totalLines, lineHeight };
}

//
// useCollapsibleLines: A React hook that provides the logic for making a text container collapsible
// if it exceeds a specified number of lines.
//
// T – the type of the text container element.
// C – the optional type for a “cutout” element, if any.
//
export default function useCollapsibleLines<T extends HTMLElement>(
  ref: RefObject<T | null>,
  maxLinesBeforeCollapse: number,
  isDisabled?: boolean,
) {
  const isFirstRenderRef = useRef(true);
  const cutoutHeightRef = useRef<number>(0);

  const [isCollapsible, setIsCollapsible] = useState(!isDisabled);
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible);

  const getElement = useStableCallback(() => ref?.current);

  useLayoutEffect(() => {
    const element = getElement();
    if (isDisabled || !element) return;

    requestMutation(() => {
      element.style.maxHeight = isCollapsed
        ? `${cutoutHeightRef.current}px`
        : "100dvh";
    });
  }, [isCollapsed, isDisabled, ref]);

  const recalculateTextLines = useCallback(() => {
    const element = getElement();

    if (isDisabled || !element) return;
    const { lineHeight, totalLines } = calcTextLineHeightAndCount(element);

    if (totalLines > maxLinesBeforeCollapse) {
      cutoutHeightRef.current = lineHeight * maxLinesBeforeCollapse;
      setIsCollapsible(true);
    } else {
      setIsCollapsible(false);
      setIsCollapsed(false);
    }
  }, [isDisabled, maxLinesBeforeCollapse, ref]);

  const debouncedRecalcTextLines = useDebouncedFunction(
    () => requestMeasure(recalculateTextLines),
    WINDOW_RESIZE_LINE_RECALC_DEBOUNCE,
    false,
    true,
    [recalculateTextLines],
  );

  useLayoutEffect(() => {
    if (!isDisabled && isFirstRenderRef.current) {
      requestNextMutation(() => {
        recalculateTextLines();

        return () => {
          isFirstRenderRef.current = false;
          const element = getElement();

          if (element) {
            element.style.maxHeight = cutoutHeightRef.current
              ? `${cutoutHeightRef.current}px`
              : "";
          }
        };
      });
    }
  }, [isDisabled, recalculateTextLines, ref]);

  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (!isDisabled) {
      if (isFirstRenderRef.current) return;
      debouncedRecalcTextLines();
    } else {
      setIsCollapsible(false);
      setIsCollapsed(false);
    }
  }, [debouncedRecalcTextLines, isDisabled, windowWidth]);

  return {
    isCollapsed,
    isCollapsible,
    setIsCollapsed,
  };
}
