import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { FC, memo, JSX, useCallback, useMemo } from "react";
import buildClassName from "@/shared/lib/buildClassName";
import { useAccordionContext } from "../lib/accordion-context";
import { contentVariants, createItemProps } from "../lib/accordion-variants";
import "./accordion-swift-item.scss";
import { requestNextMutation } from "@/lib/modules/fastdom";

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
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    useEffect(() => {
      if (contentRef.current) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          const height = entries[0]?.contentRect.height ?? 0;
          if (isOpen) {
            setContentHeight(height);
          }
        });

        resizeObserverRef.current.observe(contentRef.current);
      }

      return () => {
        resizeObserverRef.current?.disconnect();
      };
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) {
        setContentHeight(0);
      } else if (contentRef.current) {
        requestNextMutation(() => {
          const height = contentRef.current!.scrollHeight;
          return () => setContentHeight(height);
        });
      }
    }, [isOpen, children]);

    const positionProps = useMemo(() => {
      const openIndexSet = new Set(openIndexes);
      const isFirstChild = index === 0;
      const isLastChild = index === childCount - 1;
      const isSingleChild = childCount === 1;

      const isPrevChild = allowMultiple
        ? openIndexSet.has(index + 1)
        : openIndexes[0] === index + 1;

      const isNextChild = allowMultiple
        ? openIndexSet.has(index - 1)
        : openIndexes[0] === index - 1;

      return {
        isFirstChild,
        isLastChild,
        isPrevChild,
        isNextChild,
        isSingleChild,
      };
    }, [index, childCount, openIndexes, allowMultiple]);

    const handleToggle = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (propOnToggle) {
          propOnToggle(index);
        } else {
          toggleIndex(index);
        }
      },
      [index, propOnToggle, toggleIndex],
    );

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
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants(contentHeight, !!shouldReduceMotion)}
            >
              <div className="accordion-body" ref={contentRef}>
                {Array.isArray(bodyContent)
                  ? bodyContent.map((child, i) =>
                      React.isValidElement(child) ? (
                        React.cloneElement(child, { key: i })
                      ) : (
                        <React.Fragment key={i}>{child}</React.Fragment>
                      ),
                    )
                  : bodyContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

AccordionSwiftItem.displayName = "AccordionSwiftItem";
