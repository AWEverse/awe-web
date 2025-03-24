import React from "react";
import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { FC, memo, JSX, useCallback, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { useAccordionContext } from "../lib/accordion-context";
import { createItemProps, createContentProps } from "../lib/accordion-variants";
import "./accordion-swift-item.scss";

export type AccordionItemProps = {
  as?: React.ElementType;
  title?: React.ReactNode;
  children: React.ReactNode;
  index: number;
  className?: string;
  isOpen?: boolean;
  onToggle?: (index: number) => void;
};

export const AccordionSwiftItem: FC<AccordionItemProps> = memo(
  ({
    title,
    children,
    isOpen: propIsOpen,
    onToggle: propOnToggle,
    index,
    className,
  }): JSX.Element => {
    const shouldReduceMotion = useReducedMotion();

    const { openIndexes, toggleIndex, childCount, allowMultiple } =
      useAccordionContext();

    const isOpen = propIsOpen ?? openIndexes.includes(index);

    const positionProps = useMemo(() => {
      const isFirstChild = index === 0;
      const isLastChild = index === childCount - 1;
      const isSingleChild = childCount === 1;

      let isPrevChild = false;
      let isNextChild = false;

      if (!allowMultiple) {
        const currentOpenIndex = openIndexes.length > 0 ? openIndexes[0] : -1;
        isPrevChild = currentOpenIndex !== -1 && index === currentOpenIndex - 1;
        isNextChild = currentOpenIndex !== -1 && index === currentOpenIndex + 1;
      } else {
        for (let i = 0, len = openIndexes.length; i < len; ++i) {
          if (index === openIndexes[i] - 1) {
            isPrevChild = true;
          }

          if (index === openIndexes[i] + 1) {
            isNextChild = true;
          }
        }
      }

      return {
        isFirstChild,
        isLastChild,
        isPrevChild,
        isNextChild,
        isSingleChild,
      };
    }, [index, childCount, openIndexes, allowMultiple]);

    const handleToggle = useCallback(() => {
      if (propOnToggle) {
        propOnToggle(index);
      } else {
        toggleIndex(index);
      }
    }, [index, propOnToggle, toggleIndex]);

    const [titleContent, bodyContent] = useMemo(() => {
      if (title) {
        return [title, children];
      }

      if (React.Children.count(children) > 1) {
        const childrenArray = React.Children.toArray(children);
        return [childrenArray[0], childrenArray.slice(1)];
      }

      return [null, children];
    }, [title, children]);

    const headerId = `accordion-header-${index}`;
    const contentId = `accordion-content-${index}`;

    return (
      <motion.div
        role="region"
        aria-expanded={isOpen}
        aria-labelledby={headerId}
        className={buildClassName("accordion-swift-item", className)}
        {...createItemProps(isOpen, positionProps, !!shouldReduceMotion)}
        key={`accordion-item-${index}`}
      >
        <button
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          onClick={handleToggle}
          className="accordion-header"
          aria-controls={contentId}
        >
          {titleContent && <span className="font-medium">{titleContent}</span>}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={contentId}
              key="content"
              role="region"
              aria-labelledby={headerId}
              {...createContentProps(!!shouldReduceMotion)}
            >
              <div className="accordion-body">{bodyContent}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

AccordionSwiftItem.displayName = "AccordionSwiftItem";
