import { requestMutation } from "@/lib/modules/fastdom";
import { useComponentDidMount } from "../hooks/effects/useLifecycle";

interface ElementExtras {
  classes: Set<string>;
  styles: Record<string, string>;
}

const elementExtras = new WeakMap<HTMLElement, ElementExtras>();

// Get (or initialize) the extras object for an element.
function getExtras(element: HTMLElement): ElementExtras {
  let extras = elementExtras.get(element);
  if (!extras) {
    extras = { classes: new Set(), styles: {} };
    elementExtras.set(element, extras);
  }
  return extras;
}

/** Hook to clean up extras on unmount for a list of refs. */
export function useExtraStyles(refs: React.RefObject<HTMLElement | null>[]) {
  useComponentDidMount(() => {
    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          elementExtras.delete(ref.current);
        }
      });
    };
  });
}

/** Checks if a CSS property is a valid custom property. */
export function isValidCustomProperty(prop: string): boolean {
  return /^--[a-zA-Z0-9-]+$/.test(prop);
}

/** Adds an extra class to the element if not already added. */
export function addExtraClass(element: HTMLElement, className: string) {
  const extras = getExtras(element);
  if (!extras.classes.has(className)) {
    element.classList.add(className);
    extras.classes.add(className);
  }
}

/** Removes an extra class from the element if present. */
export function removeExtraClass(element: HTMLElement, className: string) {
  const extras = elementExtras.get(element);
  if (extras && extras.classes.has(className)) {
    element.classList.remove(className);
    extras.classes.delete(className);

    if (extras.classes.size === 0 && Object.keys(extras.styles).length === 0) {
      elementExtras.delete(element);
    }
  }
}

/** Toggles an extra class. When force is defined, adds (true) or removes (false). */
export function toggleExtraClass(
  element: HTMLElement,
  className: string,
  force?: boolean
) {
  const extras = getExtras(element);
  const hasClass = extras.classes.has(className);
  const shouldAdd = force ?? !hasClass;

  shouldAdd ? addExtraClass(element, className) : removeExtraClass(element, className);
}

/** Batch updates the element's extra classes and styles in one go. */
export function batchUpdate(
  element: HTMLElement,
  update: {
    styles?: Partial<CSSStyleDeclaration> & Record<string, string>;
    classesToAdd?: string[];
    classesToRemove?: string[];
  }
) {
  const extras = getExtras(element);

  if (update.classesToAdd) {
    update.classesToAdd.forEach((cls) => {
      if (!extras.classes.has(cls)) {
        element.classList.add(cls);
        extras.classes.add(cls);
      }
    });
  }
  if (update.classesToRemove) {
    update.classesToRemove.forEach((cls) => {
      if (extras.classes.has(cls)) {
        element.classList.remove(cls);
        extras.classes.delete(cls);
      }
    });
  }

  if (update.styles) {
    batchStyles(element, (currentStyles) => {
      Object.assign(currentStyles, update.styles);
    });
  }

  if (extras.classes.size === 0 && Object.keys(extras.styles).length === 0) {
    elementExtras.delete(element);
  }
}

/** Allows batched updates to the styles object before applying changes. */
export function batchStyles(
  element: HTMLElement,
  callback: (styles: Record<string, string>) => void
) {
  const extras = getExtras(element);
  const updatedStyles = { ...extras.styles };
  callback(updatedStyles);
  setExtraStyles(element, updatedStyles);
}

/** Sets extra styles on an element and schedules a DOM update. */
export function setExtraStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> & Record<string, string>
) {
  const extras = getExtras(element);
  extras.styles = { ...extras.styles, ...styles };
  applyExtraStyles(element, extras.styles);
}

/** Applies extra styles using a batched mutation to the DOM. */
function applyExtraStyles(element: HTMLElement, styles: Record<string, string>) {
  requestMutation(() => {
    const style = element.style;

    Object.entries(styles).forEach(({ 0: prop, 1: value }) => {
      if (prop.startsWith("--")) {
        style.setProperty(prop, value);
      } else {
        // @ts-ignore: index signature for CSSStyleDeclaration can be loose.
        style[prop] = value;
      }
    });
  });
}
