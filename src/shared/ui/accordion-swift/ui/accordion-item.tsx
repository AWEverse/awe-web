import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { FC, memo, JSX, useCallback } from "react";
import { AccordionItemProps as AccordionItemWithPrivateFieldsProps } from "../lib/types";
import { itemVariants, contentVariants } from "../lib/variants";
import buildClassName from "@/shared/lib/buildClassName";

type AccordionItemPrivateFieldsProps = Readonly<
  Pick<
    AccordionItemWithPrivateFieldsProps,
    StartsWithUnderscore<keyof AccordionItemWithPrivateFieldsProps>
  >
>;

export type AccordionItemProps = Readonly<
  Omit<
    AccordionItemWithPrivateFieldsProps,
    keyof AccordionItemPrivateFieldsProps
  >
>;

export const AccordionItem: FC<AccordionItemProps> = memo(
  ({
    as: Component = "div",
    title,
    children,
    isOpen = false,
    onToggle,
    index,
    className,
    ...rest
  }): JSX.Element => {
    const {
      _isFirstChild = false,
      _isLastChild = false,
      _isNextChild = false,
      _isPrevChild = false,
    } = rest as AccordionItemPrivateFieldsProps;

    const shouldReduceMotion = useReducedMotion();

    const handleToggle = useCallback(() => {
      if (index !== undefined && onToggle) {
        onToggle(index);
      }
    }, [index, onToggle]);

    return (
      <motion.div
        data-state={isOpen ? "open" : "closed"}
        role="region"
        aria-expanded={isOpen}
        aria-labelledby={`accordion-header-${index}`}
        className={buildClassName(
          "accordion-item border border-gray-200 bg-white shadow-sm",
          className,
        )}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={itemVariants}
        custom={{
          isFirstChild: _isFirstChild,
          isLastChild: _isLastChild,
          isPrevChild: _isPrevChild,
          isNextChild: _isNextChild,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      >
        <button
          id={`accordion-header-${index}`}
          onClick={handleToggle}
          className="accordion-header block w-full h-full p-2 cursor-pointer text-left font-semibold text-gray-800 focus:outline-none"
          aria-controls={`accordion-content-${index}`}
        >
          <span className="font-medium">{title}</span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`accordion-content-${index}`}
              key="content"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              style={{
                willChange: "height, opacity",
                transform: "translateZ(0)",
              }}
            >
              <div className="p-4 text-gray-700 ">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

AccordionItem.displayName = "AccordionItem";
