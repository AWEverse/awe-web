import {
  Children,
  FC,
  ReactNode,
  memo,
  useState,
  useMemo,
  useEffect,
  cloneElement,
  isValidElement,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton, { ActionButtonProps } from "@/shared/ui/ActionButton";
import { useStableCallback } from "@/shared/hooks/base";
import s from "./SlideButton.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import TrackNavigation from "@/shared/ui/TrackNavigation";

export interface SlideButtonProps {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  interval?: number;
  type?: "slide" | "fade";
  duration?: number;
  easing?: string;
  onSlideChange?: (index: number) => void;
  classNames?: {
    container?: string;
    child?: string;
  };
}

const SlideButton: FC<SlideButtonProps & ActionButtonProps> = ({
  children,
  direction = "vertical",
  interval = 0,
  type = "slide",
  duration = 0.125,
  easing = "easeInOut",
  onSlideChange,
  classNames = {},
  className,
  ...rest
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const totalSlides = Children.count(children);

  if (totalSlides === 0) {
    throw new Error("SlideButton requires at least one child element");
  }

  useEffect(() => {
    if (interval > 0 && !isHovered) {
      const timer = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % totalSlides);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [interval, isHovered, totalSlides]);

  const handleNextSlide = useStableCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const newIndex = (slideIndex + 1) % totalSlides;
      setSlideIndex(newIndex);
      onSlideChange?.(newIndex);
    },
  );

  const currentChild = useMemo(() => {
    const child = Children.toArray(children)[slideIndex];
    return isValidElement<{ className?: string }>(child)
      ? cloneElement(child, {
          className: `${child.props.className || ""} ${s.SlideContent}`,
        })
      : child;
  }, [children, slideIndex]);

  return (
    <ActionButton
      onClick={handleNextSlide}
      className={buildClassName(s.SlideButtonRoot, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Slide control (${slideIndex + 1} of ${totalSlides})`}
      {...rest}
    >
      <TrackNavigation count={totalSlides} index={slideIndex} />
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          variants={proccessAnimation(type, direction)}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease: easing }}
          className={buildClassName(s.SlideChild, classNames.child)}
          aria-live="polite"
          aria-atomic="true"
        >
          {currentChild}
        </motion.div>
      </AnimatePresence>

      <div
        className={buildClassName(s.HiddenChild, classNames.child)}
        aria-hidden="true"
      >
        {currentChild}
      </div>
      <span className={s.mark}>
        {slideIndex + 1}/{totalSlides}
      </span>
    </ActionButton>
  );
};

const proccessAnimation = (type: string, direction: string) => {
  const axis = direction === "vertical" ? "y" : "x";

  return type === "slide"
    ? {
        enter: { [axis]: "100%", opacity: 1 },
        center: { [axis]: 0, opacity: 1 },
        exit: { [axis]: "-100%", opacity: 1 },
      }
    : {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      };
};

export default memo(SlideButton);
