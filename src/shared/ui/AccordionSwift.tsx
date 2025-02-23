import React, {
  FC,
  ReactNode,
  memo,
  useCallback,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  useState,
  JSX,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import "./AccordionSwift.scss";

const TRANSITION = 0.125;

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (index: number) => void;
  index?: number;
  _isNextChild?: boolean;
  _isPrevChild?: boolean;
  _isFirstChild?: boolean;
  _isLastChild?: boolean;
  _isSingleChild?: boolean;
}

const getDataChildAttr = (
  isOpen: boolean,
  isNextChild: boolean,
  isPrevChild: boolean,
): string => {
  if (isOpen) return "current";
  if (isNextChild) return !isPrevChild ? "next" : "beetween";
  if (isPrevChild) return "prev";
  return "another";
};

const itemVariants = {
  open: (custom: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isSingleChild: boolean;
  }) => {
    const margin = !custom.isSingleChild
      ? `${!custom.isFirstChild ? "0.5rem" : "0"} 0 ${!custom.isLastChild ? "0.5rem" : "0"} 0`
      : undefined;

    return {
      margin,
      borderRadius: "0.5rem",
    };
  },
  closed: (custom: { isPrevChild: boolean; isNextChild: boolean }) => {
    const borderRadius = (() => {
      if (custom.isPrevChild) {
        return "0.5rem 0.5rem 0 0";
      }
      if (custom.isNextChild) {
        return "0 0 0.5rem 0.5rem";
      }
      return "0";
    })();

    return {
      margin: 0,
      borderRadius: borderRadius,
    };
  },
};

const contentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
};

export const AccordionItem: FC<AccordionItemProps> = memo(
  ({
    title,
    children,
    isOpen = false,
    onToggle,
    index,
    _isFirstChild = false,
    _isLastChild = false,
    _isSingleChild = false,
    _isNextChild = false,
    _isPrevChild = false,
  }): JSX.Element => {
    const shouldReduceMotion = useReducedMotion();

    const handleToggle = useCallback(() => {
      if (index !== undefined && onToggle) {
        onToggle(index);
      }
    }, [index, onToggle]);

    // Determine the data attribute for styling:
    // • If the item is active, it always returns "current"
    // • Otherwise, if an adjacent item is open, flag it as "next" or "prev"
    // • Also allowed for multiple opened items mode between
    const dataChildAttr = getDataChildAttr(isOpen, _isNextChild, _isPrevChild);

    return (
      <motion.div
        data-open={isOpen}
        data-child={dataChildAttr}
        className="accordion-item p-2 border border-gray-200 bg-white cursor-pointer shadow-sm"
        onClick={handleToggle}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={itemVariants}
        custom={{
          isFirstChild: _isFirstChild,
          isLastChild: _isLastChild,
          isSingleChild: _isSingleChild,
          isPrevChild: _isPrevChild,
          isNextChild: _isNextChild,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : TRANSITION,
        }}
      >
        <button className="accordion-header w-full text-left font-semibold text-gray-800 focus:outline-none">
          {title}
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              transition={{
                duration: shouldReduceMotion ? 0 : TRANSITION,
              }}
              style={{ willChange: "height" }}
            >
              <div className="p-4 text-gray-700">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

interface AccordionGroupProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultOpenIndexes?: number[];
}

export const AccordionGroup: FC<AccordionGroupProps> = ({
  children,
  allowMultiple = false,
  defaultOpenIndexes = [],
}): JSX.Element => {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  const getAccordionState = useCallback(
    (openIndexes: number[]) => {
      if (allowMultiple) {
        const openSet = new Set(openIndexes);
        const prevSet = new Set<number>();
        const nextSet = new Set<number>();

        for (const index of openIndexes) {
          prevSet.add(index + 1);
          nextSet.add(index - 1);
        }

        return { openSet, prevSet, nextSet };
      } else {
        const currentOpenIndex = openIndexes[0] ?? -1;

        return {
          currentOpenIndex,
          prevIndex: currentOpenIndex - 1,
          nextIndex: currentOpenIndex + 1,
        };
      }
    },
    [allowMultiple],
  );

  const accordionState = useMemo(
    () => getAccordionState(openIndexes),
    [openIndexes, getAccordionState],
  );

  const toggleIndex = useCallback(
    (index: number) => {
      setOpenIndexes((prev) => {
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        }
        return allowMultiple ? [...prev, index] : [index];
      });
    },
    [allowMultiple],
  );

  return (
    <div className="accordion-group">
      {Children.map(childrenArray, (child, index) => {
        if (!isValidElement(child)) return child;

        let isOpen: boolean, isPrevChild: boolean, isNextChild: boolean;

        if (allowMultiple) {
          const { openSet, prevSet, nextSet } = accordionState;
          isOpen = !!openSet?.has(index);
          isPrevChild = !!prevSet?.has(index);
          isNextChild = !!nextSet?.has(index);
        } else {
          const { currentOpenIndex, prevIndex, nextIndex } = accordionState;
          isOpen = currentOpenIndex !== undefined && index === currentOpenIndex;
          isPrevChild = index === nextIndex && !isOpen;
          isNextChild = index === prevIndex;
        }

        const isFirstChild = index === 0;
        const isLastChild = index === childrenArray.length - 1;
        const isSingleChild = childrenArray.length === 1;

        return cloneElement(child as React.ReactElement<AccordionItemProps>, {
          isOpen,
          onToggle: toggleIndex,
          index,
          _isFirstChild: isFirstChild,
          _isLastChild: isLastChild,
          _isSingleChild: isSingleChild,
          _isNextChild: isNextChild,
          _isPrevChild: isPrevChild,
        });
      })}
    </div>
  );
};
