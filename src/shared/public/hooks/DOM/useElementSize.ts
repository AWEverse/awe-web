import { useRef } from "react";
import { useStableCallback } from "../base";
import { requestMeasure } from "@/lib/modules/fastdom";
import { useComponentDidMount } from "../effects/useLifecycle";

export type Size = Readonly<{
  width: number;
  height: number;
}>;

/**
 * A high-performance hook for tracking element dimensions
 * @returns A tuple containing:
 * - ref: Attach this to the element you want to measure
 * - size: Current element dimensions (null before first measurement)
 * - isResizing: Boolean flag indicating if the element is actively resizing
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(elementRef: React.RefObject<T>) {
  const sizeRef = useRef<Size | null>(null);
  const isResizing = useRef(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const getSize = useStableCallback(() => sizeRef.current);

  const measureNow = useStableCallback(() => {
    const element = elementRef.current;
    if (!element) return null;

    requestMeasure(() => {
      const rect = element.getBoundingClientRect();
      const newSize: Size = {
        width: rect.width,
        height: rect.height
      };

      if (!sizeRef.current ||
        sizeRef.current.width !== newSize.width ||
        sizeRef.current.height !== newSize.height) {
        sizeRef.current = newSize;
      }
    })

    return sizeRef.current;
  });

  useComponentDidMount(() => {
    const element = elementRef.current;
    if (!element) return;

    measureNow();

    let rafId: number | null = null;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      isResizing.current = true;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const borderBoxSize = entry.borderBoxSize?.[0];

        if (borderBoxSize) {
          sizeRef.current = {
            width: borderBoxSize.inlineSize,
            height: borderBoxSize.blockSize,
          };
        } else if (entry.contentRect) {
          sizeRef.current = {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          };
        }

        isResizing.current = false;
        rafId = null;
      });
    });

    observer.observe(element, { box: "border-box" });
    observerRef.current = observer;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      observerRef.current = null;
    };
  });

  return {
    size: sizeRef,
    isResizing,
    measureNow,
    getSize
  };
}
