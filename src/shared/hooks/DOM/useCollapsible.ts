import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { requestMeasure, requestMutation } from "@/lib/modules/fastdom";
import { useDebouncedFunction } from "../shedulers";
import useWindowSize from "@/shared/hooks/DOM/useWindowSize";
import { useStableCallback } from "../base";

const WINDOW_RESIZE_DEBOUNCE = 200;

function calcTextLines(element: HTMLElement, maxLines: number) {
  const style = getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2; // Fallback to font-size * 1.2
  const rect = element.getBoundingClientRect();
  const contentHeight = rect.height;

  const totalLines = Math.ceil(contentHeight / lineHeight);
  const cutoutHeight = lineHeight * maxLines;

  return { totalLines, cutoutHeight, lineHeight };
}

export default function useCollapsibleLines<T extends HTMLElement>(
  ref: RefObject<T | null>,
  maxLinesBeforeCollapse: number,
  isDisabled?: boolean
) {
  const elementRef = useRef<T | null>(null);
  const cutoutHeightRef = useRef<number>(0);
  const [state, setState] = useState({ isCollapsible: false, isCollapsed: false });

  const getElement = useStableCallback(() => elementRef.current);

  const recalculateTextLines = useCallback(() => {
    const element = getElement();

    if (!element || isDisabled) {
      setState({ isCollapsible: false, isCollapsed: false });
      return;
    }

    const { totalLines, cutoutHeight } = calcTextLines(element, maxLinesBeforeCollapse);
    const shouldCollapse = totalLines > maxLinesBeforeCollapse;

    cutoutHeightRef.current = cutoutHeight;

    setState((prev) => {
      const newState = { isCollapsible: shouldCollapse, isCollapsed: shouldCollapse && prev.isCollapsed };
      if (newState.isCollapsible !== prev.isCollapsible || newState.isCollapsed !== prev.isCollapsed) {
        requestMutation(() => {
          element.style.maxHeight = newState.isCollapsed ? `${cutoutHeight}px` : "";
        });
      }
      return newState;
    });
  }, [maxLinesBeforeCollapse, isDisabled, getElement]);

  const debouncedRecalc = useDebouncedFunction(
    () => requestMeasure(recalculateTextLines),
    WINDOW_RESIZE_DEBOUNCE,
    false,
    true,
    [maxLinesBeforeCollapse, isDisabled]
  );

  useEffect(() => {
    elementRef.current = ref.current;
    if (!isDisabled && ref.current) {
      requestMeasure(recalculateTextLines);
    }

    return () => {
      const element = getElement();
      if (element) element.style.maxHeight = ""; // Cleanup
    };
  }, [ref, isDisabled]);

  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (!isDisabled) debouncedRecalc();
  }, [windowWidth, isDisabled, debouncedRecalc]);

  const setIsCollapsed = useCallback((isCollapsed: boolean) => {
    const element = getElement();
    if (!element || !state.isCollapsible) return;

    setState((prev) => {
      if (prev.isCollapsed === isCollapsed) return prev;
      const newState = { ...prev, isCollapsed };

      requestMutation(() => {
        element.style.maxHeight = isCollapsed ? `${cutoutHeightRef.current}px` : "";
      });

      return newState;
    });
  }, [state.isCollapsible, getElement]);

  return {
    isCollapsed: state.isCollapsed,
    isCollapsible: state.isCollapsible,
    setIsCollapsed,
  };
}
