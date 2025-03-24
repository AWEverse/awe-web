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
