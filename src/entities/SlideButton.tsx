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
  Fragment,
  useCallback,
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
        setSlideIndex((prev) => {
          const newIndex = (prev + 1) % totalSlides;
          onSlideChange?.(newIndex);
          return newIndex;
        });
      }, interval);
      return () => clearInterval(timer);
    }
  }, [interval, isHovered, totalSlides, onSlideChange]);

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
    if (
      isValidElement<{ className?: string; children: React.ReactNode }>(child)
    ) {
      if (child.type === Fragment) {
        return <div className={s.SlideContent}>{child.props.children}</div>;
      }
      return cloneElement(child, {
        className: buildClassName(child.props.className, s.SlideContent),
      });
    }
    return child;
  }, [children, slideIndex]);

  const animationVariants = useMemo(() => {
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
  }, [type, direction]);

  const handleMouseEnter = useStableCallback(() => setIsHovered(true));
  const handleMouseLeave = useStableCallback(() => setIsHovered(false));

  return (
    <ActionButton
      onClick={handleNextSlide}
      className={buildClassName(s.SlideButtonRoot, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Slide control (${slideIndex + 1} of ${totalSlides})`}
      {...rest}
    >
      <div className={s.SlideTrack}>
        <TrackNavigation count={totalSlides} index={slideIndex} />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={slideIndex}
          variants={animationVariants}
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

export default memo(SlideButton);
