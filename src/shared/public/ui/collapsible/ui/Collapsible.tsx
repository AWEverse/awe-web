import {
  createElement,
  useState,
  useRef,
  JSX,
  FC,
  ReactElement,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import buildClassName from "@/shared/lib/buildClassName";

import s from "./Collapsible.module.scss";
import { useStableCallback } from "@/shared/hooks/base";
import { CollapsibleContext, useCollapsible } from "../hooks/useCollapsible";
import { requestMeasure } from "@/lib/modules/fastdom";
import { clamp } from "@/lib/core";

interface ContentProps {
  children: React.ReactNode;
  className?: string;
  unmountOnExit?: boolean;
  contentClassName?: string;
  component?: keyof JSX.IntrinsicElements | null;
}

type ButtonProps = JSX.IntrinsicElements["button"];
type DivProps = Omit<
  JSX.IntrinsicElements["div"],
  keyof HTMLMotionProps<"div">
>;

const MIN_DURATION = 0.15; // in seconds for framer-motion
const MAX_DURATION = 0.5; // in seconds for framer-motion
const MAX_HEIGHT = 1000;

const calculateDuration = (height: number): number => {
  const duration =
    (height / MAX_HEIGHT) * (MAX_DURATION - MIN_DURATION) + MIN_DURATION;

  return clamp(duration, MIN_DURATION, MAX_DURATION);
};

const Content: FC<ContentProps & DivProps> = ({
  children,
  className,
  component = "div",
  contentClassName,
  unmountOnExit = true,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { isOpen } = useCollapsible();
  const [duration, setDuration] = useState(MIN_DURATION);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const node = contentRef.current;

    if (!node) return;

    requestMeasure(() => {
      const height = node.scrollHeight;
      setContentHeight(height);
      const newDuration = calculateDuration(height);

      setDuration((prevDuration) =>
        prevDuration !== newDuration ? newDuration : prevDuration,
      );
    });
  }, [isOpen, children]);

  const variants = {
    open: {
      height: contentHeight,
      opacity: 1,
      transition: {
        duration: duration,
        ease: "easeInOut",
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: duration,
        ease: "easeInOut",
      },
    },
  };

  const safeMotionProps: HTMLMotionProps<"div"> = {};

  for (const key in props) {
    if (
      ![
        "onDrag",
        "onDragStart",
        "onDragEnd",
        "onAnimationStart",
        "onAnimationComplete",
      ].includes(key)
    ) {
      safeMotionProps[key as keyof HTMLMotionProps<"div">] =
        props[key as keyof typeof props];
    }
  }

  const renderChild = () => (
    <AnimatePresence initial={false}>
      {(isOpen || !unmountOnExit) && (
        <motion.div
          ref={contentRef}
          className={buildClassName(s.Content, contentClassName)}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={variants}
          style={{ overflow: "hidden" }}
          {...safeMotionProps}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return component !== null
    ? (createElement(component, {
        className: buildClassName(s.root, className),
        children: renderChild(),
      }) as ReactElement)
    : renderChild();
};

interface TriggerProps {
  onOpenChange?: (open: boolean) => void;
}

const Trigger: FC<TriggerProps & ButtonProps> = ({
  children,
  onClick,
  onMouseDown,
  onOpenChange,
  className,
  ...props
}) => {
  const { isOpen, toggleCollapse } = useCollapsible();

  const handleClick = useStableCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      toggleCollapse();
      onClick?.(e);
      onOpenChange?.(!isOpen);
    },
  );

  return (
    <button
      className={buildClassName(s.trigger, className)}
      type="button"
      onClick={handleClick}
      onMouseDown={onMouseDown}
      {...props}
    >
      {children}
    </button>
  );
};

interface RootProps {
  title?: string;
  component?: keyof JSX.IntrinsicElements | null;
}

const Root: FC<RootProps & JSX.IntrinsicElements["div"]> = ({
  title,
  children,
  className,
  component = "div",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = useStableCallback(() => {
    setIsOpen((prev) => !prev);
  });

  return (
    <CollapsibleContext.Provider value={{ isOpen, toggleCollapse }}>
      {component !== null
        ? (createElement(component, {
            title: title,
            className: buildClassName(s.root, className),
            children,
            ...props,
          }) as ReactElement)
        : children}
    </CollapsibleContext.Provider>
  );
};

export { Root, Trigger, Content };
