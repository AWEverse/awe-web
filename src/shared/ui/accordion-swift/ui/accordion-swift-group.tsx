import React, {
  FC,
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
import useStateSet from "@/shared/hooks/state/useStateSet";

import "./accordion-swift-group.scss";
import buildClassName from "@/shared/lib/buildClassName";

export const AccordionSwiftGroup: FC<Readonly<AccordionGroupProps>> =
  React.memo(
    ({
      children,
      allowMultiple = false,
      defaultOpenIndexes = [],
      className,
    }) => {
      const {
        values: openIndexes,
        has,
        add,
        remove,
        clear,
      } = useStateSet<number>(
        allowMultiple ? defaultOpenIndexes : [defaultOpenIndexes[0]],
      );

      const toggleIndex = useCallback(
        (index: number) => {
          if (has(index)) {
            remove(index);
          } else {
            if (!allowMultiple) {
              clear();
            }
            add(index);
          }
        },
        [allowMultiple],
      );

      const childCount = useMemo(() => Children.count(children), [children]);

      const currentOpenIndex = () => {
        if (allowMultiple) {
          return -1;
        }

        const { 0: first } = openIndexes;

        return first ?? -1;
      };

      return (
        <div
          className={buildClassName(
            "accordion-swift-group",
            "accordion-stepper",
            className,
          )}
          role="tablist"
          aria-multiselectable={allowMultiple}
        >
          <div className="splite"></div>
          {Children.map(children, (child, index) => {
            if (!isValidElement(child)) {
              return child;
            }

            const isOpen = allowMultiple
              ? has(index)
              : index === currentOpenIndex();

            const isPrevChild = allowMultiple
              ? has(index + 1)
              : index === currentOpenIndex() - 1;

            const isNextChild = allowMultiple
              ? has(index - 1)
              : index === currentOpenIndex() + 1;

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

AccordionSwiftGroup.displayName = "AccordionSwiftGroup";
