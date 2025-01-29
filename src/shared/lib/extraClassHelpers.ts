import { useComponentDidMount } from "../hooks/effects/useLifecycle";

const extraClasses = new WeakMap<HTMLElement, Set<string>>();
const extraStyles = new WeakMap<HTMLElement, Record<string, string>>();

// // Initialize the hook
// useExtraStyles(ref);

// // Example: Add a class and styles
// React.useEffect(() => {
//   if (ref.current) {
//     addExtraClass(ref.current, 'my-class');
//     setExtraStyles(ref.current, { color: 'red', '--custom-var': 'blue' });
//   }
// }, []);
export function useExtraStyles(refs: React.RefObject<HTMLElement>[]) {
  useComponentDidMount(() => {
    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          extraClasses.delete(ref.current);
          extraStyles.delete(ref.current);
        }
      });
    };
  });
}

export function isValidCustomProperty(prop: string): boolean {
  return /^--[a-zA-Z0-9-]+$/.test(prop);
}

function getClassSet(element: HTMLElement): Set<string> {
  let classSet = extraClasses.get(element);

  if (!classSet) {
    classSet = new Set();
    extraClasses.set(element, classSet);
  }

  return classSet;
}

export function addExtraClass(element: HTMLElement, className: string) {
  const classSet = getClassSet(element);
  if (!classSet.has(className)) {
    element.classList.add(className);
    classSet.add(className);
  }
}

export function removeExtraClass(element: HTMLElement, className: string) {
  const classSet = extraClasses.get(element);
  if (classSet?.has(className)) {
    element.classList.remove(className);
    classSet.delete(className);
    if (classSet.size === 0) {
      extraClasses.delete(element);
    }
  }
}

export function toggleExtraClass(
  element: HTMLElement,
  className: string,
  force?: boolean,
) {
  const hasClass = extraClasses.get(element)?.has(className);
  const shouldAdd = force ?? !hasClass;

  if (shouldAdd) {
    addExtraClass(element, className);
  } else {
    removeExtraClass(element, className);
  }
}

export function batchStyles(
  element: HTMLElement,
  callback: (styles: Record<string, string>) => void,
) {
  const styles = { ...extraStyles.get(element) };
  callback(styles);
  setExtraStyles(element, styles);
}

export function setExtraStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> & AnyLiteral,
) {
  const currentStyles = extraStyles.get(element) || {};
  const newStyles = { ...currentStyles, ...styles };

  extraStyles.set(element, newStyles);
  applyExtraStyles(element, newStyles);
}

function applyExtraStyles(
  element: HTMLElement,
  styles: Record<string, string>,
) {
  const style = element.style;

  requestAnimationFrame(() => {
    for (const prop in styles) {
      const value = styles[prop];
      if (prop.startsWith("--")) {
        style.setProperty(prop, value);
      } else {
        style[prop as any] = value;
      }
    }
  });
}
