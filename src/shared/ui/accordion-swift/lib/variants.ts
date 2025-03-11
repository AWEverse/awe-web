export const TRANSITION_DURATION = 0.2;

// Helper functions for computing style values
const computeMargin = ({ isFirstChild, isLastChild }: { isFirstChild: boolean; isLastChild: boolean }) => {
  return isFirstChild && isLastChild
    ? "0px"
    : `${!isFirstChild ? "0.5rem" : "0"} 0 ${!isLastChild ? "0.5rem" : "0"} 0`;
};

const computeBorderRadiusClosed = (custom: {
  isFirstChild: boolean;
  isLastChild: boolean;
  isPrevChild: boolean;
  isNextChild: boolean;
}) => {
  if (custom.isFirstChild && custom.isLastChild) return "0.5rem";
  if (custom.isLastChild) return !custom.isNextChild ? "0 0 0.5rem 0.5rem" : "0.5rem";
  if (custom.isFirstChild || custom.isNextChild) return !custom.isPrevChild ? "0.5rem 0.5rem 0 0" : "0.5rem";
  if (custom.isPrevChild) return "0 0 0.5rem 0.5rem";
  return "0";
};

export const itemVariants = {
  open: (custom: { isFirstChild: boolean; isLastChild: boolean }) => ({
    margin: computeMargin(custom),
    borderRadius: "0.5rem",
    transition: { duration: TRANSITION_DURATION }
  }),
  closed: (custom: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isPrevChild: boolean;
    isNextChild: boolean;
  }) => ({
    borderRadius: computeBorderRadiusClosed(custom),
    transition: { duration: TRANSITION_DURATION },
    margin: "0px",
  }),
};

export const contentVariants = {
  visible: {
    opacity: 1,
    // Consider using layout animations if "auto" height causes performance issues:
    height: "auto",
    transition: {
      height: { duration: TRANSITION_DURATION, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: TRANSITION_DURATION * 0.75, ease: "linear" }
    }
  },
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: TRANSITION_DURATION, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: TRANSITION_DURATION * 0.5, ease: "linear" }
    }
  }
};
