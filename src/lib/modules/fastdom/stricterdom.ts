/* eslint-disable @typescript-eslint/no-explicit-any */
import LAYOUT_CAUSES from "./layoutCauses";

// Type Definitions
type AnyFunction = (...args: any[]) => any;
export type DOMPhase = "measure" | "mutate" | "reflow";
type ErrorHandler = (error: Error) => void;

// Default Error Handler with improved formatting
const defaultErrorHandler: ErrorHandler = (error) => {
  const [title, ...rest] = error.message.split("\n");
  console.group(
    `%cLayout Strict Mode Error%c ${title}`,
    "color: red; font-weight: bold; font-size: 14px",
    "color: inherit"
  );
  console.log("%cFull Error Message:", "font-weight: bold", error.message);
  console.log("%cStack Trace:", "font-weight: bold", error.stack);
  console.groupEnd();
};

// State Variables
let currentDOMPhase: DOMPhase = "measure";
let isStrictModeEnabled = false;
let errorHandler: ErrorHandler = defaultErrorHandler;
const nativeMethods = new Map<string, AnyFunction>();
let mutationObserver: MutationObserver | undefined;
const allowedMutationNodes = new WeakSet<Node>(); // Use WeakSet for better memory management
const reportedErrors = new Set<string>();

// Utility Functions
function getElementInfo(element: Node): string {
  if (element.nodeType !== Node.ELEMENT_NODE) return "unknown element";
  const el = element as Element;
  const tagName = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const className = el.className
    ? `.${el.className.split(" ").join(".")}`
    : "";
  return `${tagName}${id}${className}`;
}

function extractLocationFromStack(stack: string | undefined): string {
  if (!stack) return "unknown location";
  const lines = stack.split("\n");
  for (let i = 2; i < lines.length; i++) {
    const match = lines[i].match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) return `${match[2]}:${match[3]}:${match[4]}`;
  }
  return "unknown location";
}

// DOMPhase Control
export const setDOMPhase = (newDOMPhase: DOMPhase) => { currentDOMPhase = newDOMPhase; };
export const getDOMPhase = () => currentDOMPhase;
export const getIsStrict = () => isStrictModeEnabled;

// Strict Mode Toggle
export const enableStrict = () => {
  if (!isStrictModeEnabled) {
    reportedErrors.clear();
    setupLayoutDetectors();
    setupMutationObserver();
    isStrictModeEnabled = true;
  }
};

export const disableStrict = () => {
  if (isStrictModeEnabled) {
    clearMutationObserver();
    clearLayoutDetectors();
    isStrictModeEnabled = false;
    reportedErrors.clear();
  }
};

// Force Methods
export const forceMeasure = <T>(callback: () => T): T => {
  if (currentDOMPhase !== "mutate") {
    const current = JSON.stringify(currentDOMPhase);
    throw new Error(
      `forceMeasure: Expected 'mutate' DOMPhase to allow measurements, ` +
      `but current DOMPhase is '${current}'. ` +
      "Wrap measurements in forceMeasure() only during 'mutate' DOMPhase."
    );
  }
  const original = currentDOMPhase;
  currentDOMPhase = "measure";
  try {
    return callback();
  } finally {
    currentDOMPhase = original;
  }
};

export const forceMutation = <T>(callback: () => T, nodes: Node | Node[]): T => {
  if (currentDOMPhase !== "measure") {
    const current = JSON.stringify(currentDOMPhase);
    throw new Error(
      `forceMutation: Expected 'measure' DOMPhase to allow mutations, ` +
      `but current DOMPhase is '${current}'. ` +
      "Wrap mutations in forceMutation() only during 'measure' DOMPhase."
    );
  }
  if (isStrictModeEnabled) {
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(node => allowedMutationNodes.add(node));
  }
  try {
    return callback();
  } finally {
    if (isStrictModeEnabled) {
      (Array.isArray(nodes) ? nodes : [nodes]).forEach(node => allowedMutationNodes.delete(node));
    }
  }
};

// Custom Error Handler
export const setHandler = (handler?: ErrorHandler) => {
  errorHandler = handler || defaultErrorHandler;
};

const getEntityPrototype = (name: string): any | undefined => {
  const entity = (window as any)[name];
  return entity ? (typeof entity === "object" ? entity : entity.prototype) : undefined;
};
// Layout Detection Setup
const setupLayoutDetectors = () => {
  Object.entries(LAYOUT_CAUSES).forEach(([entityName, causes]) => {
    const prototype = getEntityPrototype(entityName);
    if (!prototype) return;

    if ("props" in causes && Array.isArray(causes.props)) {
      if (causes.props && causes.props.length) {
        causes.props.forEach(prop => {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
          const nativeGetter = descriptor?.get;
          if (!nativeGetter) return;

          nativeMethods.set(`${entityName}#${prop}`, nativeGetter);
          Object.defineProperty(prototype, prop, {
            configurable: true,
            get: function () {
              onLayoutError(prop, this);
              return nativeGetter.call(this);
            }
          });
        });
      }


      if ("methods" in causes && Array.isArray(causes.props)) {
        if (causes.methods?.length) {
          causes.methods.forEach(method => {
            const nativeMethod = prototype[method];
            if (typeof nativeMethod !== "function") return;

            nativeMethods.set(`${entityName}#${method}`, nativeMethod);
            prototype[method] = function (...args: any[]) {
              onLayoutError(method, this);
              return nativeMethod.apply(this, args);
            };
          });
        }
      }
    }
  });
};

const clearLayoutDetectors = () => {
  Object.entries(LAYOUT_CAUSES).forEach(([entityName, causes]) => {
    const prototype = getEntityPrototype(entityName);
    if (!prototype) return;

    if ("props" in causes && Array.isArray(causes.props)) {

      if (causes.props?.length) {
        causes.props.forEach(prop => {
          const nativeGetter = nativeMethods.get(`${entityName}#${prop}`);
          if (nativeGetter) {
            const descriptor = Object.getOwnPropertyDescriptor(
              prototype,
              prop
            );
            descriptor?.get &&
              Object.defineProperty(prototype, prop, descriptor);
          }
        });
      }

      if ("methods" in causes && Array.isArray(causes.props)) {

        if (causes.methods?.length) {
          causes.methods.forEach(method => {
            const nativeMethod = nativeMethods.get(`${entityName}#${method}`);
            if (nativeMethod) prototype[method] = nativeMethod;
          });
        }
      }
    }
  });
  nativeMethods.clear();
};

// Mutation Observer Setup
const setupMutationObserver = () => {
  mutationObserver = new MutationObserver(mutations => {
    if (currentDOMPhase === "mutate") return;
    mutations.forEach(handleMutation);
  });
  mutationObserver.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: false
  });
};

const clearMutationObserver = () => {
  mutationObserver?.disconnect();
  mutationObserver = undefined;
};

// Error Handling Functions
const onLayoutError = (property: string, element: Node) => {
  if (currentDOMPhase === "measure") return;
  const location = extractLocationFromStack(new Error().stack);
  const elementInfo = getElementInfo(element);
  const errorMessage = `Unexpected layout measurement: "${property}" on ${elementInfo} ` +
    `during '${currentDOMPhase}' DOMPhase at ${location}. ` +
    "Use forceMeasure() for intentional measurements outside 'measure' DOMPhase.";
  reportError(errorMessage);
};

const handleMutation = (mutation: MutationRecord) => {
  if (allowedMutationNodes.has(mutation.target)) return;
  if (!document.contains(mutation.target)) return;
  if (mutation.type === "childList" && (mutation.target as HTMLElement).isContentEditable) return;
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
};

const reportError = (message: string) => {
  if (reportedErrors.has(message)) return;
  reportedErrors.add(message);
  const error = new Error(message);
  errorHandler(error);
};
