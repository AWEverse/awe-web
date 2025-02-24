import buildClassName from "@/shared/lib/buildClassName";
import React, {
  FC,
  useState,
  useMemo,
  Children,
  useCallback,
  isValidElement,
  cloneElement,
} from "react";
import {
  AccordionGroupProps,
  AccordionItemProps as AccordionItemWithPrivateFieldsProps,
} from "../lib/types";

export const AccordionGroup: FC<Readonly<AccordionGroupProps>> = React.memo(
  ({ children, allowMultiple = false, defaultOpenIndexes = [], className }) => {
    const [openIndexes, setOpenIndexes] =
      useState<number[]>(defaultOpenIndexes);
    const childrenArray = useMemo(() => Children.toArray(children), [children]);

    const toggleIndex = useCallback(
      (index: number) => {
        setOpenIndexes((prev) => {
          try {
            const indexSet = new Set(prev);
            if (indexSet.has(index)) {
              indexSet.delete(index);
            } else {
              if (!allowMultiple) indexSet.clear();
              indexSet.add(index);
            }
            return Array.from(indexSet);
          } catch (error) {
            console.error("Error toggling accordion:", error);
            return prev;
          }
        });
      },
      [allowMultiple],
    );

    const childCount = childrenArray.length;
    const openSet = useMemo(() => new Set(openIndexes), [openIndexes]);
    const currentOpenIndex = useMemo(
      () => (allowMultiple ? -1 : (openIndexes[0] ?? -1)),
      [allowMultiple, openIndexes],
    );

    return (
      <div
        className={buildClassName(className)}
        role="tablist"
        aria-multiselectable={allowMultiple}
      >
        {Children.map(childrenArray, (child, index) => {
          if (!isValidElement(child)) return child;

          const isOpen = allowMultiple
            ? openSet.has(index)
            : index === currentOpenIndex;

          const isPrevChild = allowMultiple
            ? openSet.has(index + 1)
            : index === currentOpenIndex - 1;

          const isNextChild = allowMultiple
            ? openSet.has(index - 1)
            : index === currentOpenIndex + 1;

          return cloneElement(
            child as React.ReactElement<AccordionItemWithPrivateFieldsProps>,
            {
              isOpen,
              onToggle: toggleIndex,
              index,
              _isFirstChild: index === 0,
              _isLastChild: index === childCount - 1,
              _isNextChild: isNextChild,
              _isPrevChild: isPrevChild,
              _isSingleChild: childCount === 1,
            },
          );
        })}
      </div>
    );
  },
);

AccordionGroup.displayName = "AccordionGroup";
