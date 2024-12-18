/* eslint-disable @typescript-eslint/no-explicit-any */
import LAYOUT_CAUSES from './layoutCauses';

type Entities = keyof typeof LAYOUT_CAUSES;
type Phase = 'measure' | 'mutate';
type ErrorHandler = (error: Error) => any;

const DEFAULT_ERROR_HANDLER = console.error;

let onError: ErrorHandler = DEFAULT_ERROR_HANDLER;

const nativeMethods = new Map<string, AnyFunction>();

let phase: Phase = 'measure';
let isStrict = false;
let observer: MutationObserver | undefined;

export function setPhase(newPhase: Phase) {
  phase = newPhase;
}

export function getPhase() {
  return phase;
}

export function getIsStrict() {
  return isStrict;
}

export function enableStrict() {
  if (isStrict) return;

  isStrict = true;
  setupLayoutDetectors();
  setupMutationObserver();
}

export function disableStrict() {
  if (!isStrict) return;

  clearMutationObserver();
  clearLayoutDetectors();
  isStrict = false;
}

export function forceMeasure(cb: NoneToVoidFunction) {
  if (phase !== 'mutate') {
    throw new Error("The current phase is 'measure'");
  }

  phase = 'measure';
  const result = cb();
  phase = 'mutate';

  return result;
}

const forcedMutationAllowedFor = new Set<Node>();

export function forceMutation(cb: NoneToVoidFunction, nodes: Node | Node[]) {
  if (phase !== 'measure') {
    throw new Error("The current phase is 'mutate'");
  }

  if (isStrict) {
    if (Array.isArray(nodes)) {
      nodes.forEach(forcedMutationAllowedFor.add);
    } else {
      forcedMutationAllowedFor.add(nodes);
    }
  }

  return cb();
}

export function setHandler(handler?: ErrorHandler) {
  onError = handler || DEFAULT_ERROR_HANDLER;
}

function getEntityPrototype(name: string) {
  const entity = window[name as Entities];

  if (entity) {
    return typeof entity === 'object' ? entity : entity.prototype;
  }
}

function setupLayoutDetectors() {
  for (const [name, causes] of Object.entries(LAYOUT_CAUSES)) {
    const prototype = getEntityPrototype(name);

    if ('props' in causes) {
      causes.props.forEach(prop => {
        const nativeGetter = Object.getOwnPropertyDescriptor(prototype, prop)?.get;

        if (!nativeGetter) {
          return;
        }

        nativeMethods.set(`${name}#${prop}`, nativeGetter);

        Object.defineProperty(prototype, prop, {
          get() {
            onMeasure(prop);

            return nativeGetter.call(this);
          },
        });
      });
    }

    if ('methods' in causes) {
      causes.methods.forEach(method => {
        const nativeMethod = (prototype as any)[method]!;
        nativeMethods.set(`${name}#${method}`, nativeMethod);

        (prototype as any)[method] = function (...args: any[]) {
          onMeasure(method);

          return nativeMethod.apply(this, args);
        };
      });
    }
  }
}

function clearLayoutDetectors() {
  for (const [name, causes] of Object.entries(LAYOUT_CAUSES)) {
    const prototype = getEntityPrototype(name);

    if ('props' in causes) {
      causes.props.forEach(prop => {
        const nativeGetter = nativeMethods.get(`${name}#${prop}`);
        if (!nativeGetter) {
          return;
        }

        Object.defineProperty(prototype, prop, { get: nativeGetter });
      });
    }

    if ('methods' in causes) {
      causes.methods.forEach(method => {
        (prototype as any)[method] = nativeMethods.get(`${name}#${method}`)!;
      });
    }
  }

  nativeMethods.clear();
}

function setupMutationObserver() {
  observer = new MutationObserver(mutations => {
    if (phase !== 'mutate') {
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

function clearMutationObserver() {
  observer?.disconnect();
  observer = undefined;
}

function onMeasure(propName: string) {
  if (phase !== 'measure') {
    onError(new Error(`Unexpected measurement detected: \`${propName}\``));
  }
}

const applyMutation = ({ target, type, attributeName }: MutationRecord) => {
  if (!document.contains(target)) {
    return;
  }

  if (forcedMutationAllowedFor.has(target)) {
    return;
  }

  if (type === 'childList' && target instanceof HTMLElement && target.contentEditable) {
    return;
  }

  if (attributeName?.startsWith('data-')) {
    return;
  }

  onError(
    new Error(`Unexpected mutation detected: \`${type === 'attributes' ? attributeName : type}\``),
  );
};
