const extraClasses = new WeakMap<HTMLElement, Set<string>>();
const extraStyles = new WeakMap<HTMLElement, Record<string, string>>();

export function addExtraClass(element: HTMLElement, className: string) {
  element.classList.add(className);

  const classList = extraClasses.get(element);
  if (classList) {
    classList.add(className);
  } else {
    extraClasses.set(element, new Set([className]));
  }
}

export function removeExtraClass(element: HTMLElement, className: string) {
  element.classList.remove(className);

  const classList = extraClasses.get(element);
  if (classList) {
    classList.delete(className);

    if (!classList.size) {
      extraClasses.delete(element);
    }
  }
}

export function toggleExtraClass(
  element: HTMLElement,
  className: string,
  force?: boolean,
) {
  if (force === true) {
    addExtraClass(element, className);
  } else if (force === false) {
    removeExtraClass(element, className);
  } else if (extraClasses.get(element)?.has(className)) {
    removeExtraClass(element, className);
  } else {
    addExtraClass(element, className);
  }
}

export function setExtraStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> & AnyLiteral,
) {
  extraStyles.set(element, styles);
  applyExtraStyles(element);
}

function applyExtraStyles(element: HTMLElement) {
  const standardStyles = Object.entries(extraStyles.get(element)!).reduce<
    Record<string, string>
  >((acc, [prop, value]) => {
    if (prop.startsWith("--")) {
      element.style.setProperty(prop, value);
    } else {
      acc[prop] = value;
    }

    return acc;
  }, {});

  Object.assign(element.style, standardStyles);
}
