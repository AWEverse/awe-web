export const isElementInViewport = (elem: HTMLElement) => {
  const { top, left, bottom, right } = elem.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  const { clientHeight, clientWidth } = document.documentElement;

  return top >= 0 && left >= 0 && bottom <= (innerHeight || clientHeight) && right <= (innerWidth || clientWidth);
};

type Axis = 'scrollTop' | 'scrollLeft';
type Dimension = 'offsetHeight' | 'offsetWidth' | 'offsetTop' | 'offsetLeft';

export const isFullyVisible = (container: HTMLElement, element: HTMLElement, isHorizontal = false) => {
  const axis: Axis = isHorizontal ? 'scrollLeft' : 'scrollTop';
  const dimension: Dimension = isHorizontal ? 'offsetWidth' : 'offsetHeight';
  const position: Dimension = isHorizontal ? 'offsetLeft' : 'offsetTop';

  const viewportStart = container[axis];
  const viewportEnd = viewportStart + container[dimension];

  const elementStart = element[position];
  const elementEnd = elementStart + element[dimension];

  return elementStart >= viewportStart && elementEnd <= viewportEnd;
};

type OverflowSides = {
  vertical?: 'top' | 'bottom';
  horizontal?: 'left' | 'right';
};

export const getOverflowSides = (container: HTMLElement, element: HTMLElement): OverflowSides => {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  const overflowSides: OverflowSides = {};

  if (elementRect.top < containerRect.top) {
    overflowSides.vertical = 'top';
  } else if (elementRect.bottom > containerRect.bottom) {
    overflowSides.vertical = 'bottom';
  }

  if (elementRect.left < containerRect.left) {
    overflowSides.horizontal = 'left';
  } else if (elementRect.right > containerRect.right) {
    overflowSides.horizontal = 'right';
  }

  return overflowSides;
};
