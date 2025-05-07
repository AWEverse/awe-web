
export const TRANSITION_DURATION = 0.2;
export const EASING = [0.4, 0, 0.2, 1];

// Types for custom properties
type PositionProps = {
  isFirstChild: boolean;
  isLastChild: boolean;
  isPrevChild?: boolean;
  isNextChild?: boolean;
  isSingleChild?: boolean;
};

/**
 * Computes margin based on position in accordion
 * Memoization friendly - returns same string for same inputs
 */
const computeMargin = ({ isFirstChild, isLastChild }: PositionProps): string => {
  if (isFirstChild && isLastChild) return "0px";

  const topMargin = isFirstChild ? "0" : "0.5rem";
  const bottomMargin = isLastChild ? "0" : "0.5rem";

  return `${topMargin} 0 ${bottomMargin} 0`;
};

/**
 * Computes border radius based on position in accordion
 * Memoization friendly - returns same string for same inputs
 */
const computeBorderRadius = ({
  isFirstChild,
  isLastChild,
  isPrevChild = false,
  isNextChild = false,
  isSingleChild = false
}: PositionProps) => {
  if (isSingleChild || (isFirstChild && isLastChild)) return "0.5rem";

  if (isLastChild) {
    return !isNextChild ? "0 0 0.5rem 0.5rem" : "0.5rem";
  }

  if (isFirstChild || isNextChild) {
    return !isPrevChild ? "0.5rem 0.5rem 0 0" : "0.5rem";
  }

  if (isPrevChild) {
    return "0 0 0.5rem 0.5rem";
  }

  return "0";
};

// Shared transition defaults
const defaultTransition = {
  duration: TRANSITION_DURATION,
  ease: EASING
};

/**
 * Optimized variants for accordion items
 * Uses type safety and memoization-friendly computations
 */
export const itemVariants = {
  open: (custom: PositionProps) => ({
    margin: computeMargin(custom),
    borderRadius: "0.5rem",
    transition: defaultTransition
  }),
  closed: (custom: PositionProps) => ({
    margin: "0px",
    borderRadius: computeBorderRadius(custom),
    transition: defaultTransition
  })
};

/**
 * Optimized variants for accordion content
 * Uses layout animations for smoother height transitions
 */
export const contentVariants = (
  contentHeight: number,
  shouldReduceMotion?: boolean
) => {
  if (shouldReduceMotion) {
    return {
      visible: { opacity: 1, height: "auto" },
      hidden: { opacity: 0, height: 0 }
    };
  }

  return {
    visible: {
      opacity: 1,
      height: contentHeight,
      transition: {
        height: defaultTransition,
        opacity: { duration: TRANSITION_DURATION * 0.75, ease: "linear" }
      }
    },
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        height: defaultTransition,
        opacity: { duration: TRANSITION_DURATION * 0.5, ease: "linear" }
      }
    }
  };
};
/**
 * Helper to create motion item props
 * Centralizes common props for motion items
 */
export const createItemProps = (
  isOpen: boolean,
  positionProps: PositionProps,
  shouldReduceMotion: boolean
) => ({
  initial: false,
  animate: isOpen ? "open" : "closed",
  variants: itemVariants,
  custom: positionProps,
  transition: {
    duration: shouldReduceMotion ? 0 : TRANSITION_DURATION
  }
});

/**
 * Helper to create motion content props
 * Centralizes common props for motion content
 */
export const createContentProps = (shouldReduceMotion: boolean) => ({
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
  variants: contentVariants,
  transition: {
    duration: shouldReduceMotion ? 0 : TRANSITION_DURATION
  },
  style: {
    willChange: "height, opacity",
    transform: "translateZ(0)"
  }
});
