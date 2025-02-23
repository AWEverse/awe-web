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
  if (isOpen) {
    return "current";
  }
  if (isNextChild) {
    return isPrevChild ? "beetween" : "next";
  }
  if (isPrevChild) {
    return "prev";
  }
  return "another";
};

const getDataChildRadius = (
  isFirstChild: boolean,
  isLastChild: boolean,
  isNextChild: boolean,
  isPrevChild: boolean,
): string => {
  if (isFirstChild && isLastChild) {
    return "0.5rem";
  }

  if (isLastChild) {
    return !isNextChild ? "0 0 0.5rem 0.5rem" : "0.5rem";
  }

  if (isFirstChild || isNextChild) {
    return !isPrevChild ? "0.5rem 0.5rem 0 0" : "0.5rem";
  }

  if (isPrevChild) {
    return "0 0 0.5rem 0.5rem";
  }

  return "0rem";
};

const itemVariants = {
  open: (custom: { isFirstChild: boolean; isLastChild: boolean }) => {
    const margin = !(custom.isFirstChild && custom.isLastChild)
      ? `${!custom.isFirstChild ? "0.5rem" : "0"} 0 ${!custom.isLastChild ? "0.5rem" : "0"} 0`
      : undefined;

    return {
      margin,
      borderRadius: "0.5rem",
    };
  },
  closed: (custom: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isPrevChild: boolean;
    isNextChild: boolean;
  }) => {
    const borderRadius = getDataChildRadius(
      custom.isFirstChild,
      custom.isLastChild,
      custom.isNextChild,
      custom.isPrevChild,
    );

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
        className="accordion-item border border-gray-200 bg-white shadow-sm"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={itemVariants}
        custom={{
          isFirstChild: _isFirstChild,
          isLastChild: _isLastChild,
          isPrevChild: _isPrevChild,
          isNextChild: _isNextChild,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : TRANSITION,
        }}
      >
        <button
          onClick={handleToggle}
          className="accordion-header block w-full h-full p-2 cursor-pointer text-left font-semibold text-gray-800 focus:outline-none"
        >
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

  const toggleIndex = useCallback(
    (index: number) => {
      setOpenIndexes((prev) => {
        const indexSet = new Set(prev);
        if (indexSet.has(index)) {
          indexSet.delete(index);
        } else {
          if (!allowMultiple) indexSet.clear();
          indexSet.add(index);
        }
        return Array.from(indexSet);
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
    <div className="accordion-group">
      {Children.map(childrenArray, (child, index) => {
        if (!isValidElement(child)) return child;

        const isOpen = allowMultiple
          ? openSet.has(index)
          : index === currentOpenIndex;

        let isPrevChild = false;
        let isNextChild = false;

        if (allowMultiple && childCount > 1) {
          isPrevChild = openSet.has(index + 1);
          isNextChild = openSet.has(index - 1);
        } else {
          isPrevChild = index === currentOpenIndex - 1;
          isNextChild = index === currentOpenIndex + 1;
        }

        return cloneElement(child as React.ReactElement<AccordionItemProps>, {
          isOpen,
          onToggle: toggleIndex,
          index,
          _isFirstChild: index === 0,
          _isLastChild: index === childCount - 1,
          _isNextChild: isNextChild,
          _isPrevChild: isPrevChild,
          _isSingleChild: childCount === 1,
        });
      })}
    </div>
  );
};
