type Axis = 'scrollTop' | 'scrollLeft';

function isFullyVisible(container: HTMLElement, element: HTMLElement, isHorizontal = false): boolean {
  const axis: Axis = isHorizontal ? 'scrollLeft' : 'scrollTop';

  const viewportStart = container[axis];
  const viewportEnd = viewportStart + container[isHorizontal ? 'offsetWidth' : 'offsetHeight'];

  const elementStart = element[isHorizontal ? 'offsetLeft' : 'offsetTop'];
  const elementEnd = elementStart + element[isHorizontal ? 'offsetWidth' : 'offsetHeight'];

  return elementStart > viewportStart && elementEnd < viewportEnd;
}

export default isFullyVisible;
