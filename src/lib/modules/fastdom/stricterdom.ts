/* eslint-disable @typescript-eslint/no-explicit-any */
import LAYOUT_CAUSES from "./layoutCauses";

// Type Definitions
type AnyFunction = (...args: any[]) => any;
export type DOMPhase = "measure" | "mutate" | "reflow";
type ErrorHandler = (error: Error) => void;
type EntityCauses = { props?: string[], methods?: string[] };

// Performance optimizations: pre-allocate constant strings and values
const MEASURE = "measure";
const MUTATE = "mutate";
const ENTITY_METHOD_SEPARATOR = "#";

// Default Error Handler with improved formatting
const defaultErrorHandler: ErrorHandler = (error) => {
  const [title, ...rest] = error.message.split("\n");
  console.group(
    "%cLayout Strict Mode Error%c " + title,
    "color: red; font-weight: bold; font-size: 14px",
    "color: inherit"
  );
  console.log("%cFull Error Message:", "font-weight: bold", error.message);
  console.log("%cStack Trace:", "font-weight: bold", error.stack);
  console.groupEnd();
};

// State Variables - use let for values that change, const for references that don't
let currentDOMPhase: DOMPhase = MEASURE;
let isStrictModeEnabled = false;
let errorHandler: ErrorHandler = defaultErrorHandler;
const nativeMethods = new Map<string, AnyFunction>();
let mutationObserver: MutationObserver | undefined;
const allowedMutationNodes = new WeakSet<Node>(); // WeakSet for better memory management
const reportedErrors = new Set<string>();

// Cache DOM API lookups
const NODE_ELEMENT_NODE = Node.ELEMENT_NODE;
const ElementPrototype = Element.prototype;

/**
 * Gets a readable description of a DOM element
 */
function getElementInfo(element: Node): string {
  if (element.nodeType !== NODE_ELEMENT_NODE) return "unknown element";

  const el = element as Element;
  const tagName = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";

  // Only compute className if needed
  let className = "";
  if (el.className && typeof el.className === "string") {
    className = `.${el.className.split(" ").join(".")}`;
  }

  return tagName + id + className;
}

/**
 * Extracts location information from error stack
 */
function extractLocationFromStack(stack: string | undefined): string {
  if (!stack) return "unknown location";

  const lines = stack.split("\n");
  // Start at 2 to skip the Error constructor and this function
  for (let i = 2; i < lines.length; i++) {
    const match = lines[i].match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) return `${match[2]}:${match[3]}:${match[4]}`;
  }

  return "unknown location";
}

// DOMPhase Control - inline simple functions for better performance
export const setDOMPhase = (newDOMPhase: DOMPhase) => { currentDOMPhase = newDOMPhase; };
export const getDOMPhase = () => currentDOMPhase;
export const getIsStrict = () => isStrictModeEnabled;

/**
 * Enables strict DOM phase detection
 */
export function enableStrict() {
  if (!isStrictModeEnabled) {
    reportedErrors.clear();
    setupLayoutDetectors();
    setupMutationObserver();
    isStrictModeEnabled = true;
  }
}

/**
 * Disables strict DOM phase detection
 */
export function disableStrict() {
  if (isStrictModeEnabled) {
    clearMutationObserver();
    clearLayoutDetectors();
    isStrictModeEnabled = false;
    reportedErrors.clear();
  }
}

/**
 * Forces measurement operations during mutation phase
 */
export function forceMeasure<T>(callback: () => T): T {
  if (currentDOMPhase !== MUTATE) {
    throw new Error(
      `forceMeasure: Expected 'mutate' DOMPhase to allow measurements, ` +
      `but current DOMPhase is '${currentDOMPhase}'. ` +
      "Wrap measurements in forceMeasure() only during 'mutate' DOMPhase."
    );
  }

  currentDOMPhase = MEASURE;
  try {
    return callback();
  } finally {
    currentDOMPhase = MUTATE;
  }
}

/**
 * Forces mutation operations during measure phase
 */
export function forceMutation<T>(callback: () => T, nodes: Node | Node[]): T {
  if (currentDOMPhase !== MEASURE) {
    throw new Error(
      `forceMutation: Expected 'measure' DOMPhase to allow mutations, ` +
      `but current DOMPhase is '${currentDOMPhase}'. ` +
      "Wrap mutations in forceMutation() only during 'measure' DOMPhase."
    );
  }

  // Skip WeakSet operations if strict mode is disabled
  if (isStrictModeEnabled) {
    const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
    const len = nodeArray.length;
    for (let i = 0; i < len; i++) {
      allowedMutationNodes.add(nodeArray[i]);
    }

    try {
      return callback();
    } finally {
      for (let i = 0; i < len; i++) {
        allowedMutationNodes.delete(nodeArray[i]);
      }
    }
  } else {
    return callback();
  }
}

/**
 * Sets a custom error handler
 */
export function setHandler(handler?: ErrorHandler) {
  errorHandler = handler || defaultErrorHandler;
}

/**
 * Gets the prototype of a window global entity
 */
function getEntityPrototype(name: string): any | undefined {
  const entity = (window as any)[name];
  if (!entity) return undefined;
  return typeof entity === "object" ? entity : entity.prototype;
}

/**
 * Sets up layout detection by instrumenting DOM API methods
 */
function setupLayoutDetectors() {
  Object.entries(LAYOUT_CAUSES).forEach(([entityName, causes]) => {
    const prototype = getEntityPrototype(entityName);
    if (!prototype) return;

    // Handle property getters
    const props = (causes as unknown as EntityCauses).props;
    if (props && Array.isArray(props) && props.length) {
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
        const nativeGetter = descriptor?.get;

        if (!nativeGetter) continue;

        const key = entityName + ENTITY_METHOD_SEPARATOR + prop;
        nativeMethods.set(key, nativeGetter);

        Object.defineProperty(prototype, prop, {
          configurable: true,
          get: function () {
            onLayoutError(prop, this);
            return nativeGetter.call(this);
          }
        });
      }
    }

    // Handle methods
    const methods = (causes as unknown as EntityCauses).methods;
    if (methods && Array.isArray(methods) && methods.length) {
      for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        const nativeMethod = prototype[method];

        if (typeof nativeMethod !== "function") continue;

        const key = entityName + ENTITY_METHOD_SEPARATOR + method;
        nativeMethods.set(key, nativeMethod);

        prototype[method] = function (...args: any[]) {
          onLayoutError(method, this);
          return nativeMethod.apply(this, args);
        };
      }
    }
  });
}

/**
 * Restores original DOM API methods
 */
function clearLayoutDetectors() {
  Object.entries(LAYOUT_CAUSES).forEach(([entityName, causes]) => {
    const prototype = getEntityPrototype(entityName);
    if (!prototype) return;

    // Restore property getters
    const props = (causes as unknown as EntityCauses).props;
    if (props && Array.isArray(props) && props.length) {
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const key = entityName + ENTITY_METHOD_SEPARATOR + prop;
        const nativeGetter = nativeMethods.get(key);

        if (nativeGetter) {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
          if (descriptor?.get) {
            Object.defineProperty(prototype, prop, descriptor);
          }
        }
      }
    }

    // Restore methods
    const methods = (causes as unknown as EntityCauses).methods;
    if (methods && Array.isArray(methods) && methods.length) {
      for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        const key = entityName + ENTITY_METHOD_SEPARATOR + method;
        const nativeMethod = nativeMethods.get(key);

        if (nativeMethod) {
          prototype[method] = nativeMethod;
        }
      }
    }
  });

  nativeMethods.clear();
}

/**
 * Sets up DOM mutation observer
 */
function setupMutationObserver() {
  mutationObserver = new MutationObserver((mutations) => {
    // Skip processing if we're in mutation phase
    if (currentDOMPhase === MUTATE) return;

    const len = mutations.length;
    for (let i = 0; i < len; i++) {
      handleMutation(mutations[i]);
    }
  });

  // Observe the entire document for mutations
  mutationObserver.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: false
  });
}

/**
 * Cleans up DOM mutation observer
 */
function clearMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = undefined;
  }
}

/**
 * Handles layout measurement errors
 */
function onLayoutError(property: string, element: Node) {
  // Allow measurements during measure phase
  if (currentDOMPhase === MEASURE) return;

  const location = extractLocationFromStack(new Error().stack);
  const elementInfo = getElementInfo(element);
  const errorMessage = `Unexpected layout measurement: "${property}" on ${elementInfo} ` +
    `during '${currentDOMPhase}' DOMPhase at ${location}. ` +
    "Use forceMeasure() for intentional measurements outside 'measure' DOMPhase.";

  reportError(errorMessage);
}

/**
 * Handles DOM mutation errors
 */
function handleMutation(mutation: MutationRecord) {
  // Skip if mutation is allowed or element is disconnected
  if (allowedMutationNodes.has(mutation.target)) return;
  if (!document.contains(mutation.target)) return;

  // Skip for content editable elements
  if (mutation.type === "childList" &&
    (mutation.target as HTMLElement).isContentEditable) return;

  // Skip for data attributes
  if (mutation.attributeName?.startsWith("data-")) return;

  const detail = mutation.type === "attributes"
    ? mutation.attributeName
    : mutation.type;

  const elementInfo = getElementInfo(mutation.target);
  const location = extractLocationFromStack(new Error().stack);
  const errorMessage = `Unexpected DOM mutation: ${detail} on ${elementInfo} ` +
    `during '${currentDOMPhase}' DOMPhase at ${location}. ` +
    "Use forceMutation() for intentional mutations during 'measure' DOMPhase.";

  reportError(errorMessage);
}

/**
 * Reports an error through the error handler, ensuring each unique error is only reported once
 */
function reportError(message: string) {
  // Skip if this exact error was already reported
  if (reportedErrors.has(message)) return;

  reportedErrors.add(message);
  errorHandler(new Error(message));
}
