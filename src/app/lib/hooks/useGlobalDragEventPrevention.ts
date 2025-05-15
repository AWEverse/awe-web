import { useEffect } from "react";

const listenerOptions = { passive: false };

type ExcludeSelector = string | string[];

/**
 * Custom hook to globally prevent drag/drop events on the document body,
 * with optional exclusion based on CSS selectors.
 */
const useGlobalDragEventPrevention = (
  excludeSelectors: ExcludeSelector = [],
): void => {
  useEffect(() => {
    const body = document.body;

    const excludeList = Array.isArray(excludeSelectors)
      ? excludeSelectors
      : [excludeSelectors];

    const excludeSelectorStr = excludeList.filter(Boolean).join(", ");

    /**
     * Efficient drag event handler that prevents default behavior unless
     * the target matches an excluded selector.
     */
    const handleDrag = (e: DragEvent): void => {
      const target = e.target as HTMLElement | null;

      if (
        !target ||
        (excludeSelectorStr && target.matches?.(excludeSelectorStr))
      ) {
        return;
      }

      e.preventDefault();

      if (!e.dataTransfer) return;

      e.dataTransfer.dropEffect = target.hasAttribute("data-dropzone")
        ? "copy"
        : "none";
    };

    /**
     * Drop event handler — prevents default behavior and stops propagation
     * unless the target is in the exclude list.
     */
    const handleDrop = (e: DragEvent): void => {
      const target = e.target as HTMLElement | null;

      if (
        !target ||
        (excludeSelectorStr && target.matches?.(excludeSelectorStr))
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
    };

    body.addEventListener("dragover", handleDrag, listenerOptions);
    body.addEventListener("dragenter", handleDrag, listenerOptions);
    body.addEventListener("drop", handleDrop, listenerOptions);

    return () => {
      body.removeEventListener("dragover", handleDrag);
      body.removeEventListener("dragenter", handleDrag);
      body.removeEventListener("drop", handleDrop);
    };
  }, [excludeSelectors]);
};

export default useGlobalDragEventPrevention;
