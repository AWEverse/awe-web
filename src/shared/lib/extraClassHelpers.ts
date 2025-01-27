type AnyLiteral = Record<string, any>;
const extraClasses = new WeakMap<HTMLElement, Set<string>>();
const extraStyles = new WeakMap<HTMLElement, Record<string, string>>();

// Pre-defined empty sets/objects for reuse
const EMPTY_SET = new Set<string>();
const EMPTY_OBJECT: AnyLiteral = {};

export function addExtraClass<T extends HTMLElement>(
  element: T,
  className: string,
) {
  const classList = extraClasses.get(element) || new Set();
  if (classList.has(className)) return;

  classList.add(className);
  extraClasses.set(element, classList);

  // Direct DOM update without checking existing classes
  element.classList.add(className);
}

export function removeExtraClass<T extends HTMLElement>(
  element: T,
  className: string,
) {
  const classList = extraClasses.get(element) || EMPTY_SET;
  if (!classList.has(className)) return;

  classList.delete(className);
  if (classList.size === 0) {
    extraClasses.delete(element);
  }

  element.classList.remove(className);
}

export function toggleExtraClass<T extends HTMLElement>(
  element: T,
  className: string,
  force?: boolean,
) {
  const classList = extraClasses.get(element) || EMPTY_SET;
  const shouldAdd = force ?? !classList.has(className);

  if (shouldAdd) {
    addExtraClass(element, className);
  } else {
    removeExtraClass(element, className);
  }
}

// Style optimization helpers
const CSS_VAR_PREFIX = "--";
const isCSSVariable = (prop: string) => prop.startsWith(CSS_VAR_PREFIX);

export function setExtraStyles<T extends HTMLElement>(
  element: T,
  styles: Partial<CSSStyleDeclaration> & AnyLiteral,
) {
  const prevStyles = extraStyles.get(element) || EMPTY_OBJECT;
  const newStyles: Record<string, string> = {};
  const styleUpdates: [string, string | null][] = [];

  // Batch style updates
  Object.entries(styles).forEach(([prop, value]) => {
    const stringValue = String(value ?? "");
    newStyles[prop] = stringValue;

    // Only update if value changed
    if (prevStyles[prop] !== stringValue) {
      styleUpdates.push([prop, stringValue]);
    }
  });

  // Process removals for properties not in new styles
  Object.keys(prevStyles)
    .filter((prop) => !(prop in newStyles))
    .forEach((prop) => styleUpdates.push([prop, null]));

  // Apply batched updates
  styleUpdates.forEach(([prop, value]) => {
    if (isCSSVariable(prop)) {
      element.style.setProperty(prop, value);
    } else if (value !== null) {
      element.style[prop as any] = value;
    } else {
      element.style.removeProperty(prop);
    }
  });

  extraStyles.set(element, newStyles);
}
