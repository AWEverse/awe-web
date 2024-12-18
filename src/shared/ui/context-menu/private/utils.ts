import { IS_MOBILE } from '@/lib/utils/OS/windowEnviroment';

export type MenuPositionPadding = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

const PADDING = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};

export default function positionMenu(
  e: MouseEvent | Touch | TouchEvent,
  elem: HTMLElement,
  side?: 'left' | 'right' | 'center',
  additionalPadding?: MenuPositionPadding,
) {
  if ((e as TouchEvent).touches) {
    e = (e as TouchEvent).touches[0];
  }

  const { pageX, pageY } = e as Touch;

  const getScrollWidthFromElement =
    (Array.from(elem.children) as HTMLElement[]).find(
      child =>
        child.classList.contains('btn-menu-items') ||
        (child.classList.contains('btn-menu-item') && !child.classList.contains('hide')),
    ) || elem;

  const menuWidth =
    getScrollWidthFromElement.scrollWidth + getScrollWidthFromElement.offsetLeft * 2;
  const menuHeight = elem.scrollHeight;

  const { width: windowWidth, height: windowHeight } = document.body.getBoundingClientRect();

  // Calculate final padding by adding additional padding
  const padding = {
    top: PADDING.top + (additionalPadding?.top || 0),
    right: PADDING.right + (additionalPadding?.right || 0),
    bottom: PADDING.bottom + (additionalPadding?.bottom || 0),
    left: PADDING.left + (additionalPadding?.left || 0),
  };

  // Set default side for positioning
  side = IS_MOBILE ? 'right' : 'left';

  const maxTop = windowHeight - menuHeight - padding.bottom;
  const maxLeft = windowWidth - menuWidth - padding.right;
  const minTop = padding.top;
  const minLeft = padding.left;

  // Get possible positions
  const sides = {
    x: {
      left: pageX,
      right: Math.min(maxLeft, pageX - menuWidth),
    },
    intermediateX: side === 'right' ? minLeft : maxLeft,
    y: {
      top: pageY,
      bottom: pageY - menuHeight,
    },
    intermediateY: maxTop,
  };

  const possibleSides = {
    x: {
      left: sides.x.left + menuWidth + padding.right <= windowWidth,
      right: sides.x.right >= padding.left,
    },
    y: {
      top: sides.y.top + menuHeight + padding.bottom <= windowHeight,
      bottom: sides.y.bottom - padding.bottom >= padding.bottom,
    },
  };

  // Calculate horizontal position
  const left = possibleSides.x[side] ? sides.x[side] : ((side = 'center'), sides.intermediateX);
  elem.style.left = `${left}px`;

  // Calculate vertical position
  let verticalSide: 'top' | 'center' = 'top';
  const top = possibleSides.y[verticalSide]
    ? sides.y[verticalSide]
    : ((verticalSide = 'center'), sides.intermediateY);

  elem.style.top = `${top}px`;

  // Set class based on the final position
  elem.className = elem.className.replace(/(top|center|bottom)-(left|center|right)/g, '');
  elem.classList.add(
    `${verticalSide === 'center' ? verticalSide : 'bottom'}-${side === 'center' ? side : side}`,
  );

  return {
    width: menuWidth,
    height: menuHeight,
  };
}
