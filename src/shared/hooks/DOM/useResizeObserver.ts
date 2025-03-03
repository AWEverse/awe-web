import { useEffect, useRef } from "react";
import { useStateRef } from "../base";

export type Size = Readonly<{
  width: number;
  height: number;
}>;

// Updated to match the onResize callback signature used below.
export type SizeChangeHandler = (entry: ResizeObserverEntry) => void;

export function isSizeEqual(a: Size, b: Size): boolean {
  return a.width === b.width && a.height === b.height;
}

export default function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  onResize: SizeChangeHandler,
  isDisabled = false
) {
  const sizeRef = useRef<Size | null>(null);
  const onResizeRef = useStateRef(onResize);

  useEffect(() => {
    if (isDisabled || !ref.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];

      if (!ref.current) return;

      const borderBoxSize = entry.borderBoxSize?.[0];
      if (!borderBoxSize) return;

      const next: Size = {
        width: borderBoxSize.inlineSize,
        height: borderBoxSize.blockSize,
      };

      const prev = sizeRef.current;
      if (!prev || !isSizeEqual(prev, next)) {
        sizeRef.current = next;
        onResizeRef.current?.(entry);
      }
    });

    observer.observe(ref.current, { box: "border-box" });

    return observer.disconnect;
  }, [ref, isDisabled]);
}
