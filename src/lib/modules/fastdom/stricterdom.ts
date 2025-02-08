/* eslint-disable @typescript-eslint/no-explicit-any */
import LAYOUT_CAUSES from "./layoutCauses";

type AnyFunction = (...args: any[]) => any;
type NoneToVoidFunction = () => void; // assuming this is the intended type
type Entities = keyof typeof LAYOUT_CAUSES;
type Phase = "measure" | "mutate";
type ErrorHandler = (error: Error) => void;

/**
 * Default error handler that prints detailed information to the console.
 */
const DEFAULT_ERROR_HANDLER: ErrorHandler = (error: Error): void => {
  console.group(
    "%cLayout Strict Mode Error",
    "color: red; font-weight: bold; font-size: 14px",
  );
  console.error(error);
  console.info(
    "This error indicates that a layout measurement or mutation was triggered unexpectedly.",
  );
  console.info(
    "Possible fixes:\n" +
      "- Wrap measurement calls within forceMeasure() if you're triggering measurements during mutation.\n" +
      "- Wrap mutation calls within forceMutation() if you intend to perform DOM changes during measurement.\n" +
      "- Verify that your component lifecycle aligns with the allowed phase.",
  );
  console.groupEnd();
};

let onError: ErrorHandler = DEFAULT_ERROR_HANDLER;

const nativeMethods = new Map<string, AnyFunction>();
let phase: Phase = "measure";
let isStrict = false;
let observer: MutationObserver | undefined;

export function setPhase(newPhase: Phase): void {
  phase = newPhase;
}

export function getPhase(): Phase {
  return phase;
}

export function getIsStrict(): boolean {
  return isStrict;
}

export function enableStrict(): void {
  if (!isStrict) {
    isStrict = true;
    setupLayoutDetectors();
    setupMutationObserver();
  }
}

export function disableStrict(): void {
  if (isStrict) {
    clearMutationObserver();
    clearLayoutDetectors();
    isStrict = false;
  }
}

/**
 * Wraps a measurement callback so that it is only executed during the 'measure' phase.
 * Throws an error if called during the wrong phase.
 */
export function forceMeasure<T>(cb: () => T): T {
  if (phase !== "mutate") {
    throw new Error(
      `forceMeasure: Expected phase 'mutate', but current phase is '${phase}'.\n` +
        `Suggestion: Wrap your measurement code within forceMeasure() only when in the mutate phase.`,
    );
  }
  phase = "measure";
  const result = cb();
  phase = "mutate";
  return result;
}

const forcedMutationAllowedFor = new Set<Node>();

/**
 * Wraps a mutation callback so that it is only executed during the 'measure' phase.
 * Throws an error if called during the wrong phase.
 */
export function forceMutation<T>(cb: () => T, nodes: Node | Node[]): T {
  if (phase !== "measure") {
    throw new Error(
      `forceMutation: Expected phase 'measure', but current phase is '${phase}'.\n` +
        `Suggestion: Call forceMutation() only during the measure phase when mutations are permitted.`,
    );
  }
  if (isStrict) {
    if (Array.isArray(nodes)) {
      nodes.forEach((node) => forcedMutationAllowedFor.add(node));
    } else {
      forcedMutationAllowedFor.add(nodes);
    }
  }
  return cb();
}

/**
 * Allows a custom error handler to be set.
 */
export function setHandler(handler?: ErrorHandler): void {
  onError = handler || DEFAULT_ERROR_HANDLER;
}

function getEntityPrototype(name: string): any | undefined {
  const entity = (window as any)[name];
  if (!entity) return undefined;
  return typeof entity === "object" ? entity : entity.prototype;
}

/**
 * Overrides layout-related properties and methods to detect measurements.
 */
function setupLayoutDetectors(): void {
  Object.entries(LAYOUT_CAUSES).forEach(([name, causes]) => {
    const prototype = getEntityPrototype(name);
    if (!prototype) return; // Skip if the entity is not found

    if ("props" in causes && Array.isArray(causes.props)) {
      causes.props.forEach((prop: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
        const nativeGetter = descriptor?.get;
        if (typeof nativeGetter !== "function") return;

        nativeMethods.set(`${name}#${prop}`, nativeGetter);
        Object.defineProperty(prototype, prop, {
          configurable: true,
          get() {
            onMeasure(prop);
            return nativeGetter.call(this);
          },
        });
      });
    }

    if ("methods" in causes && Array.isArray(causes.methods)) {
      causes.methods.forEach((method: string) => {
        const nativeMethod = prototype[method];
        if (typeof nativeMethod !== "function") return;

        nativeMethods.set(`${name}#${method}`, nativeMethod);
        prototype[method] = function (...args: any[]) {
          onMeasure(method);
          return nativeMethod.apply(this, args);
        };
      });
    }
  });
}

/**
 * Restores the original layout properties and methods.
 */
function clearLayoutDetectors(): void {
  Object.entries(LAYOUT_CAUSES).forEach(([name, causes]) => {
    const prototype = getEntityPrototype(name);
    if (!prototype) return;

    if ("props" in causes && Array.isArray(causes.props)) {
      causes.props.forEach((prop: string) => {
        const nativeGetter = nativeMethods.get(`${name}#${prop}`);
        if (!nativeGetter) return;
        Object.defineProperty(prototype, prop, {
          configurable: true,
          get: nativeGetter,
        });
      });
    }

    if ("methods" in causes && Array.isArray(causes.methods)) {
      causes.methods.forEach((method: string) => {
        const nativeMethod = nativeMethods.get(`${name}#${method}`);
        if (!nativeMethod) return;
        prototype[method] = nativeMethod;
      });
    }
  });
  nativeMethods.clear();
}

/**
 * Sets up a MutationObserver to catch unexpected DOM mutations.
 */
function setupMutationObserver(): void {
  observer = new MutationObserver((mutations) => {
    if (phase !== "mutate") {
      mutations.forEach(applyMutation);
    }
    forcedMutationAllowedFor.clear();
  });
  observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: false,
  });
}

/**
 * Stops observing DOM mutations.
 */
function clearMutationObserver(): void {
  observer?.disconnect();
  observer = undefined;
}

/**
 * Called whenever a layout measurement is detected.
 * Logs a detailed error if the measurement happens in an unexpected phase.
 */
function onMeasure(propName: string): void {
  if (phase !== "measure") {
    const message =
      `Unexpected measurement detected: "${propName}" in phase '${phase}'.\n` +
      `Suggestion: Ensure that measurements occur only during the 'measure' phase. If you intended to measure, wrap your code in forceMeasure().`;
    onError(new Error(message));
  }
}

/**
 * Called for each mutation record when the MutationObserver fires.
 * Logs detailed information if an unexpected mutation is detected.
 */
function applyMutation(mutation: MutationRecord): void {
  const { target, type, attributeName } = mutation;
  if (!document.contains(target)) return;
  if (forcedMutationAllowedFor.has(target)) return;

  // Allow mutations for contentEditable elements.
  if (
    type === "childList" &&
    target instanceof HTMLElement &&
    target.isContentEditable
  )
    return;
  // Ignore attribute mutations for data-* attributes.
  if (attributeName?.startsWith("data-")) return;

  const detail = type === "attributes" ? attributeName : type;
  const message =
    `Unexpected mutation detected: "${detail}".\n` +
    `Suggestion: Wrap mutations within forceMutation() if this change is intentional, or review your code to avoid unintended DOM changes.`;
  onError(new Error(message));
}
