const extraClasses = new WeakMap<Element, Set<string>>();
const extraStyles = new WeakMap<Element, Record<string, string>>();

/**
 * Adds an extra class to the specified element and stores it in a WeakMap.
 * @param element - The HTML element to which the class will be added.
 * @param className - The class name to add.
 */
export function addExtraClass<T extends HTMLElement>(element: T, className: string) {
  const classList = extraClasses.get(element) || new Set();

  classList.add(className);
  extraClasses.set(element, classList);

  element.classList.add(className);
}

/**
 * Removes an extra class from the specified element and cleans up the WeakMap if needed.
 * @param element - The HTML element from which the class will be removed.
 * @param className - The class name to remove.
 */
export function removeExtraClass<T extends HTMLElement>(element: T, className: string) {
  const classList = extraClasses.get(element);

  if (classList) {
    classList.delete(className);
    if (classList.size === 0) {
      extraClasses.delete(element);
    }
  }

  element.classList.remove(className);
}

/**
 * Toggles an extra class on the specified element based on the force parameter or current state.
 * @param element - The HTML element on which the class will be toggled.
 * @param className - The class name to toggle.
 * @param force - A boolean to force adding or removing the class. If undefined, it toggles based on the current state.
 */
export function toggleExtraClass<T extends HTMLElement>(
  element: T,
  className: string,
  force?: boolean,
) {
  const classList = extraClasses.get(element);
  const classExists = classList?.has(className) ?? false;

  if (force || (force === undefined && !classExists)) {
    addExtraClass(element, className);
  } else if (!force || (force === undefined && classExists)) {
    removeExtraClass(element, className);
  }
}

/**
 * Sets additional CSS styles to an element and stores them in a WeakMap.
 * @param element - The HTML element to which the styles will be applied.
 * @param styles - A record of CSS properties and their values to apply to the element.
 */
export function setExtraStyles<T extends HTMLElement>(
  element: T,
  styles: Partial<CSSStyleDeclaration> & AnyLiteral,
) {
  extraStyles.set(element, styles);
  applyExtraStyles(element, styles);
}

/**
 * Applies the stored styles to an element, separating custom properties (CSS variables) and regular styles.
 * @param element - The HTML element to which the styles will be applied.
 * @param styles - A record of CSS properties and their values to apply to the element.
 */
function applyExtraStyles<T extends HTMLElement>(
  element: T,
  styles: Partial<CSSStyleDeclaration> & AnyLiteral,
) {
  const styleEntries = Object.entries(styles);

  const standardStyles: Record<string, string> = {};

  styleEntries.forEach(([prop, value]) => {
    if (prop.startsWith('--')) {
      // If the property is a CSS variable, set it using setProperty
      element.style.setProperty(prop, value as string);
    } else {
      // Otherwise, add it to standard styles
      standardStyles[prop] = value as string;
    }
  });

  // Apply the standard styles all at once for better performance
  Object.assign(element.style, standardStyles);
}
