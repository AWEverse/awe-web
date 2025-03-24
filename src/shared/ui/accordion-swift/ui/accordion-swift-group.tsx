import React, { FC, useCallback, useMemo } from "react";
import useStateSet from "@/shared/hooks/state/useStateSet";
import buildClassName from "@/shared/lib/buildClassName";
import "./accordion-swift-group.scss";
import { AccordionGroupProps } from "../lib/accordion-types";
import { AccordionContext } from "../lib/accordion-context";

export const AccordionSwiftGroup: FC<Readonly<AccordionGroupProps>> = ({
  children,
  allowMultiple = false,
  defaultOpenIndexes = [],
  className,
}) => {
  const initialState = useMemo(
    () => (allowMultiple ? defaultOpenIndexes : [defaultOpenIndexes[0]]),
    [],
  );

  const {
    values: openIndexes,
    has,
    add,
    remove,
    clear,
  } = useStateSet<number>(initialState);

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
    [allowMultiple, has, remove, add, clear],
  );

  const childCount = useMemo(() => React.Children.count(children), [children]);

  const contextValue = useMemo(
    () => ({
      openIndexes,
      toggleIndex,
      allowMultiple,
      childCount,
    }),
    [openIndexes, toggleIndex, allowMultiple, childCount],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
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
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

AccordionSwiftGroup.displayName = "AccordionSwiftGroup";
