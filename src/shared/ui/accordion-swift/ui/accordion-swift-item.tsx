import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import { FC, memo, JSX, useCallback, useMemo, Children } from "react";
import { AccordionItemProps as AccordionItemWithPrivateFieldsProps } from "../lib/types";
import { itemVariants, contentVariants } from "../lib/variants";
import buildClassName from "@/shared/lib/buildClassName";
import "./accordion-swift-item.scss";

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

export const AccordionSwiftItem: FC<AccordionItemProps> = memo(
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

    const _children = useMemo(
      () => ({
        array: Children.toArray(children),
      }),
      [children],
    );

    return (
      <motion.div
        role="region"
        aria-expanded={isOpen}
        aria-labelledby={`accordion-header-${index}`}
        className={buildClassName("accordion-swift-item", className)}
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
          type="button"
          aria-expanded={isOpen}
          onClick={handleToggle}
          className="accordion-header"
          aria-controls={`accordion-button-${index}`}
        >
          {title ? (
            <span className="font-medium">{title}</span>
          ) : (
            _children.array[0]
          )}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`accordion-content-${index}`}
              key="content"
              role="region"
              aria-labelledby={`accordion-region-${index}`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              style={{
                willChange: "height, opacity",
                transform: "translateZ(0)",
              }}
            >
              <div className="accordion-body">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

AccordionSwiftItem.displayName = "AccordionSwiftItem";
