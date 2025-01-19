import { EKeyboardKey } from "@/lib/core";
import useLastCallback from "@/lib/hooks/callbacks/useLastCallback";
import { requestMutation, requestMeasure } from "@/lib/modules/fastdom/fastdom";
import { RefObject, useState, useEffect, useCallback } from "react";

const useKeyboardListNavigation = (
  elementRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onSelectWithEnter?: (index: number) => void,
  itemSelector?: string,
  noCaptureFocus?: boolean,
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    setFocusedIndex(-1);

    const element = elementRef.current;

    if (isOpen && element && !noCaptureFocus) {
      requestMutation(() => {
        element.tabIndex = -1;
      });
      requestMeasure(() => {
        element.focus();
      });
    }
  }, [elementRef, isOpen, noCaptureFocus]);

  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const element = elementRef.current;

      if (!element) {
        return;
      }

      const { key } = e;

      if (key === EKeyboardKey.Enter && onSelectWithEnter) {
        onSelectWithEnter(focusedIndex);
        return;
      }

      if (key !== EKeyboardKey.ArrowUp && key !== EKeyboardKey.ArrowDown) {
        return;
      }

      const focusedElement = document.activeElement;
      const elementChildren = Array.from(
        itemSelector
          ? element.querySelectorAll(itemSelector)
          : element.children,
      );

      let newIndex =
        (focusedElement && elementChildren.indexOf(focusedElement)) ||
        focusedIndex;

      if (key === EKeyboardKey.ArrowUp && newIndex > 0) {
        newIndex--;
      } else if (
        key === EKeyboardKey.ArrowDown &&
        newIndex < elementChildren.length - 1
      ) {
        newIndex++;
      } else if (elementChildren.length === 1) {
        newIndex = 0;
      } else {
        return;
      }

      const item = elementChildren[newIndex] as HTMLElement;
      if (item) {
        setFocusedIndex(newIndex);
        requestMeasure(() => {
          item.focus();
        });
      }
    },
    [elementRef, focusedIndex, onSelectWithEnter, itemSelector],
  );

  return useLastCallback(handleKeyNavigation);
};

export default useKeyboardListNavigation;
