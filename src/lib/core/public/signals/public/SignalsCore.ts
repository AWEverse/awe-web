import { MAX_INT32 } from "../../math";

const SIGNAL_SYMBOL = Symbol.for("signals");

const NODE_POOL: Node[] = [];
const MAX_POOL_SIZE = 1000;

// Config constants
const MAX_BATCH_ITERATIONS = 1000;
const MAX_RECURSION_DEPTH = 100;

function incrementVersion(version: number): number {
  return version === MAX_INT32 ? 1 : -~version;
}

// Flags for Computed and Effect.
const RUNNING = 1 << 0; // 1
const NOTIFIED = 1 << 1; // 2
const OUTDATED = 1 << 2; // 4
const DISPOSED = 1 << 3; // 8
const HAS_ERROR = 1 << 4; // 16
const TRACKING = 1 << 5; // 32

enum EVersion {
  NotUsed = -1, // Node is not reused
  Current = 0, // Current active version
}

/**
 * Node in a linked list, used to track dependencies (sources) and dependents (targets).
 * Also used to remember the last version number of the source that the target saw.
 */
type Node = {
  // Source signal that the target depends on
  _source: Signal;
  _prevSource?: Node;
  _nextSource?: Node;

  // Target that depends on the source and should be notified when the source changes
  _target: Computed | Effect;
  _prevTarget?: Node;
  _nextTarget?: Node;

  // Version number of the source that the target last saw
  _version: number;

  // Used to remember and rollback previous value of ._node
  _rollbackNode?: Node;
};

/**
 * Get a node from the pool or create a new one
 */
function getNode(): Node {
  if (NODE_POOL.length > 0) {
    return NODE_POOL.pop()!;
  }
  return {
    _source: undefined!,
    _prevSource: undefined,
    _nextSource: undefined,
    _target: undefined!,
    _prevTarget: undefined,
    _nextTarget: undefined,
    _version: EVersion.Current,
    _rollbackNode: undefined,
  } as Node;
}

/**
 * Return a node to the pool for reuse
 */
function recycleNode(node: Node): void {
  // Clear references to help GC
  node._source = undefined!;
  node._prevSource = undefined;
  node._nextSource = undefined;
  node._target = undefined!;
  node._prevTarget = undefined;
  node._nextTarget = undefined;
  node._rollbackNode = undefined;

  // Add to pool if not full
  if (NODE_POOL.length < MAX_POOL_SIZE) {
    NODE_POOL.push(node);
  }
}

// Batching state
let batchedEffect: Effect | undefined = undefined;
let batchDepth = 0;
let batchIteration = 0;
let recursionDepth = 0;

// Global version for quick checks if anything changed
let globalVersion = 0;

// Current evaluation context (computed or effect being evaluated)
let evalContext: Computed | Effect | undefined = undefined;

function startBatch() {
  batchDepth++;
}

function endBatch() {
  if (batchDepth > 1) {
    batchDepth--;
    return;
  }

  const errors: Array<{ effect: Effect; error: unknown; stack?: string }> = [];

  try {
    while (batchedEffect !== undefined) {
      let effect: Effect | undefined = batchedEffect;
      batchedEffect = undefined;

      batchIteration++;

      // Safety check to prevent infinite loops
      if (batchIteration > MAX_BATCH_ITERATIONS) {
        throw new Error(
          `Maximum batch iteration limit reached (${MAX_BATCH_ITERATIONS}). Possible infinite loop detected.`,
        );
      }

      while (effect !== undefined) {
        const next: Effect | undefined = effect._nextBatchedEffect;

        effect._nextBatchedEffect = undefined;
        effect._flags &= ~NOTIFIED;

        if (!(effect._flags & DISPOSED) && needsToRecompute(effect)) {
          try {
            recursionDepth = 0; // Reset recursion depth for each effect
            effect._callback();
          } catch (err) {
            errors.push({
              effect,
              error: err,
              stack: err instanceof Error ? err.stack : undefined,
            });
          }
        }

        effect = next;
      }
    }
  } finally {
    batchIteration = 0;
    batchDepth--;
    recursionDepth = 0;
  }

  // Handle errors after processing all effects
  if (errors.length === 1) {
    throw errors[0].error;
  } else if (errors.length > 0) {
    throw new AggregateError(
      errors.map((e) => e.error),
      `${errors.length} errors occurred during batch processing`,
    );
  }
}

/**
 * Batch multiple signal value updates into a single "commit" at the end of the provided callback.
 *
 * Batches can be nested, and changes are flushed only after the outermost batch's callback completes.
 *
 * Accessing a signal that was changed in a batch will reflect its updated value.
 *
 * @param fn The callback function.
 * @returns The value returned by the callback.
 */
function batch<T>(fn: () => T): T {
  if (batchDepth > 0) {
    return fn();
  }

  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

/**
 * Run a callback function that can access signal values without subscribing to signal updates.
 *
 * @param fn The callback function.
 * @returns The value returned by the callback.
 */
function untracked<T>(fn: () => T): T {
  const prevContext = evalContext;
  evalContext = undefined;

  try {
    return fn();
  } finally {
    evalContext = prevContext;
  }
}

/**
 * Checks whether we've exceeded the maximum recursion depth
 * to prevent stack overflows
 */
function checkRecursionDepth(): void {
  if (++recursionDepth > MAX_RECURSION_DEPTH) {
    throw new Error(
      `Maximum recursion depth exceeded (${MAX_RECURSION_DEPTH}). Possible infinite recursion detected.`,
    );
  }
}

/**
 * Adds a dependency between the current evaluation context and the provided signal.
 * Returns the dependency node or undefined if there's no current context.
 */
function addDependency(signal: Signal): Node | undefined {
  if (evalContext === undefined) {
    return undefined;
  }

  checkRecursionDepth();

  let node = signal._node;

  if (node === undefined || node._target !== evalContext) {
    // This is a new dependency. Create a new node and set it as
    // the tail of the current context's dependency list.
    node = getNode();
    node._version = EVersion.Current;
    node._source = signal;
    node._prevSource = evalContext._sources;
    node._nextSource = undefined;
    node._target = evalContext;
    node._prevTarget = undefined;
    node._nextTarget = undefined;
    node._rollbackNode = signal._node;

    if (evalContext._sources !== undefined) {
      evalContext._sources._nextSource = node;
    }

    evalContext._sources = node;
    signal._node = node;

    // Subscribe to change notifications from this dependency if we're in an effect
    // OR evaluating a computed signal that in turn has subscribers.
    if (evalContext._flags & TRACKING) {
      signal._subscribe(node);
    }

    return node;
  } else if (node._version === EVersion.NotUsed) {
    // This is an existing dependency from a previous evaluation. Reuse it.
    node._version = EVersion.Current;

    // If this node is not already the tail of the dependency list,
    // make it the new tail
    if (node._nextSource !== undefined) {
      node._nextSource._prevSource = node._prevSource;

      if (node._prevSource !== undefined) {
        node._prevSource._nextSource = node._nextSource;
      }

      node._prevSource = evalContext._sources;
      node._nextSource = undefined;

      if (evalContext._sources !== undefined) {
        evalContext._sources._nextSource = node;
      }

      evalContext._sources = node;
    }

    return node;
  }

  return undefined;
}

/**
 * Determines if a computed or effect needs to recompute by checking if any of its
 * dependencies have changed.
 */
function needsToRecompute(target: Computed | Effect): boolean {
  // Check dependencies for changed values
  for (
    let node = target._sources;
    node !== undefined;
    node = node._nextSource
  ) {
    const source = node._source;

    // If source version changed or refresh failed
    if (source._version !== node._version || !source._refresh()) {
      return true;
    }

    // If source version changed again after refresh
    if (source._version !== node._version) {
      return true;
    }
  }

  return false;
}

/**
 * Prepares the sources of a computed or effect before evaluation.
 * Marks current nodes as reusable and sets up rollbacks.
 */
function prepareSources(target: Computed | Effect) {
  let currentNode = target._sources;

  // Clear sources if there aren't any
  if (currentNode === undefined) {
    return;
  }

  while (currentNode !== undefined) {
    const sourceNode = currentNode._source._node;

    if (sourceNode !== undefined) {
      currentNode._rollbackNode = sourceNode;
    }

    // Mark the source node as the current node
    currentNode._source._node = currentNode;

    // Mark the node as reusable
    currentNode._version = EVersion.NotUsed;

    // If this is the end of the list, update target._sources
    if (currentNode._nextSource === undefined) {
      target._sources = currentNode;
      break;
    }

    currentNode = currentNode._nextSource;
  }
}

/**
 * Cleans up sources after evaluation, removing unused dependencies
 * and restoring node state.
 */
function cleanupSources(target: Computed | Effect) {
  let currentNode = target._sources;
  let newHead = undefined;

  while (currentNode !== undefined) {
    const previousNode = currentNode._prevSource;

    // Node wasn't reused, unsubscribe and remove it from the list
    if (currentNode._version === EVersion.NotUsed) {
      currentNode._source._unsubscribe(currentNode);

      if (previousNode !== undefined) {
        previousNode._nextSource = currentNode._nextSource;
      }

      if (currentNode._nextSource !== undefined) {
        currentNode._nextSource._prevSource = previousNode;
      }

      // Restore original node state before recycling
      const nodeToRecycle = currentNode;
      currentNode._source._node = currentNode._rollbackNode;

      if (currentNode._rollbackNode !== undefined) {
        currentNode._rollbackNode = undefined;
      }

      // Only recycle after using its properties
      recycleNode(nodeToRecycle);
    } else {
      // Keep track of the new head (last non-removed node)
      newHead = currentNode;

      // Restore original node state
      currentNode._source._node = currentNode._rollbackNode;

      if (currentNode._rollbackNode !== undefined) {
        currentNode._rollbackNode = undefined;
      }
    }

    // Move to the previous node
    currentNode = previousNode;
  }

  target._sources = newHead;
}

/**
 * Base class for signals (both simple and computed).
 */
declare class Signal<T = any> {
  /** @internal */
  _value: unknown;

  /**
   * @internal
   * Version numbers must always be >= 0, as the special value -1 is used by
   * nodes to mark potentially unused but reusable nodes.
   */
  _version: number;

  /** @internal */
  _node?: Node;

  /** @internal */
  _targets?: Node;

  constructor(value?: T);

  /** @internal */
  _refresh(): boolean;

  /** @internal */
  _subscribe(node: Node): void;

  /** @internal */
  _unsubscribe(node: Node): void;

  /** @internal */
  _notifyDependencies(): void;

  /**
   * Subscribe to this signal's changes
   * @returns A function to unsubscribe
   */
  subscribe(fn: (value: T) => void): NoneToVoidFunction;

  /** Get the signal's value */
  valueOf(): T;

  /** Convert the signal to a string */
  toString(): string;

  /** Convert the signal to a JSON value */
  toJSON(): T;

  /**
   * Get the signal's value without creating a dependency
   */
  peek(): T;

  /** Signal brand symbol */
  brand: typeof SIGNAL_SYMBOL;

  /** Get or set the signal's value */
  get value(): T;
  set value(value: T);
}

/**
 * Signal implementation using ES5-style prototypes to control
 * transpiled output size.
 */
function Signal(this: Signal, value?: unknown) {
  this._value = value;
  this._version = EVersion.Current;
  this._node = undefined;
  this._targets = undefined;
}

Signal.prototype.brand = SIGNAL_SYMBOL;

Signal.prototype._refresh = function () {
  return true;
};

Signal.prototype._subscribe = function (node) {
  if (this._targets !== node && node._prevTarget === undefined) {
    node._nextTarget = this._targets;

    if (this._targets !== undefined) {
      this._targets._prevTarget = node;
    }

    this._targets = node;
  }
};

Signal.prototype._unsubscribe = function (node) {
  // Only do the unsubscribe step if the signal has subscribers initially
  if (this._targets !== undefined) {
    const prev = node._prevTarget;
    const next = node._nextTarget;

    if (prev !== undefined) {
      prev._nextTarget = next;
      node._prevTarget = undefined;
    }

    if (next !== undefined) {
      next._prevTarget = prev;
      node._nextTarget = undefined;
    }

    if (node === this._targets) {
      this._targets = next;
    }
  }
};

Signal.prototype._notifyDependencies = function () {
  let currentNode = this._targets;

  while (currentNode !== undefined) {
    const nextNode = currentNode._nextTarget; // Store next before notifying in case of changes
    currentNode._target._notify();
    currentNode = nextNode;
  }
};

Signal.prototype.subscribe = function (fn) {
  return effect(() => {
    const value = this.value;

    const prevContext = evalContext;
    evalContext = undefined;

    try {
      fn(value);
    } finally {
      evalContext = prevContext;
    }
  });
};

Signal.prototype.valueOf = function () {
  return this.value;
};

Signal.prototype.toString = function () {
  return String(this.value);
};

Signal.prototype.toJSON = function () {
  return this.value;
};

Signal.prototype.peek = function () {
  const prevContext = evalContext;
  evalContext = undefined;

  try {
    return this.value;
  } finally {
    evalContext = prevContext;
  }
};

Object.defineProperty(Signal.prototype, "value", {
  get(this: Signal) {
    const node = addDependency(this);
    if (node !== undefined) {
      node._version = this._version;
    }
    return this._value;
  },
  set(this: Signal, value) {
    // Skip all the work if the value hasn't changed
    if (Object.is(value, this._value)) {
      return;
    }

    // Quick path: if no one is listening, just update the value
    if (this._targets === undefined) {
      this._value = value;
      this._version = incrementVersion(this._version);
      globalVersion = incrementVersion(globalVersion);
      return;
    }

    if (batchIteration > MAX_BATCH_ITERATIONS / 2) {
      throw new Error("Cycle detected in signal updates");
    }

    this._value = value;
    this._version = incrementVersion(this._version);
    globalVersion = incrementVersion(globalVersion);

    startBatch();
    try {
      this._notifyDependencies();
    } finally {
      endBatch();
    }
  },
});

/**
 * Create a new plain signal.
 *
 * @param value The initial value for the signal.
 * @returns A new signal.
 */
export function signal<T>(value: T): Signal<T>;
export function signal<T = undefined>(): Signal<T | undefined>;
export function signal<T>(value?: T): Signal<T> {
  return new Signal(value);
}

/**
 * A computed signal that derives its value from other signals.
 */
declare class Computed<T = any> extends Signal<T> {
  _fn: () => T;
  _sources?: Node;
  _globalVersion: number;
  _flags: number;
  _lastGlobalVersion: number; // Track the last seen global version for optimizations

  constructor(fn: () => T);

  _notify(): void;
  get value(): T;
}

function Computed(this: Computed, fn: () => unknown) {
  Signal.call(this, undefined);

  this._fn = fn;
  this._sources = undefined;
  this._globalVersion = globalVersion - 1;
  this._lastGlobalVersion = 0;
  this._flags = OUTDATED;
}

Computed.prototype = Object.create(Signal.prototype);
Computed.prototype.constructor = Computed;

Computed.prototype._refresh = function () {
  this._flags &= ~NOTIFIED;

  if (this._flags & RUNNING) {
    return false;
  }

  // Fast path: if tracking and not outdated and global version hasn't changed,
  // we can skip the update entirely
  if (
    (this._flags & (OUTDATED | TRACKING)) === TRACKING &&
    this._lastGlobalVersion === globalVersion
  ) {
    return true;
  }

  this._flags &= ~OUTDATED;
  this._lastGlobalVersion = globalVersion;

  // Quick check if anything has changed globally
  if (this._globalVersion === globalVersion && !(this._flags & OUTDATED)) {
    return true;
  }

  this._globalVersion = globalVersion;

  // Mark this computed signal as running before checking dependencies for value changes
  // so the RUNNING flag can be used to detect cyclic dependencies.
  this._flags |= RUNNING;

  if (this._version > EVersion.Current && !needsToRecompute(this)) {
    this._flags &= ~RUNNING;
    return true;
  }

  const prevContext = evalContext;

  try {
    prepareSources(this);

    evalContext = this;
    const value = this._fn();

    if (
      this._flags & HAS_ERROR ||
      !Object.is(this._value, value) ||
      this._version === EVersion.Current
    ) {
      this._value = value;
      this._flags &= ~HAS_ERROR;
      this._version = incrementVersion(this._version);
    }
  } catch (err) {
    this._value = err;
    this._flags |= HAS_ERROR;
    this._version = incrementVersion(this._version);
  }

  evalContext = prevContext;
  cleanupSources(this);
  this._flags &= ~RUNNING;
  return true;
};

Computed.prototype._subscribe = function (node) {
  if (this._targets === undefined) {
    this._flags |= OUTDATED | TRACKING;

    // Computed signal lazily subscribes to its dependencies when it gets
    // its first subscriber.
    for (
      let node = this._sources;
      node !== undefined;
      node = node._nextSource
    ) {
      node._source._subscribe(node);
    }
  }
  Signal.prototype._subscribe.call(this, node);
};

Computed.prototype._unsubscribe = function (node) {
  // Only do the unsubscribe step if the computed signal has subscribers.
  if (this._targets !== undefined) {
    Signal.prototype._unsubscribe.call(this, node);

    // Computed signal unsubscribes from its dependencies when it loses its last subscriber.
    // This allows garbage collection of unreferenced computed signal subgraphs.
    if (this._targets === undefined) {
      this._flags &= ~TRACKING;

      for (
        let node = this._sources;
        node !== undefined;
        node = node._nextSource
      ) {
        node._source._unsubscribe(node);
      }
    }
  }
};

Computed.prototype._notify = function () {
  if (!(this._flags & NOTIFIED)) {
    this._flags |= OUTDATED | NOTIFIED;

    let currentNode = this._targets;
    while (currentNode !== undefined) {
      const nextNode = currentNode._nextTarget; // Store next before notifying
      currentNode._target._notify();
      currentNode = nextNode;
    }
  }
};

Object.defineProperty(Computed.prototype, "value", {
  get(this: Computed) {
    if (this._flags & RUNNING) {
      throw new Error("Cycle detected in computed dependencies");
    }

    const node = addDependency(this);
    this._refresh();
    if (node !== undefined) {
      node._version = this._version;
    }

    if (this._flags & HAS_ERROR) {
      throw this._value;
    }
    return this._value;
  },
});

/**
 * Interface for read-only signals.
 */
interface ReadonlySignal<T = any> {
  readonly value: T;
  peek(): T;

  subscribe(fn: (value: T) => void): NoneToVoidFunction;
  valueOf(): T;
  toString(): string;
  toJSON(): T;
  brand: typeof SIGNAL_SYMBOL;
}

/**
 * Create a new signal that computes its value based on other signals.
 *
 * The returned computed signal is read-only, and its value automatically
 * updates when any signals accessed from the callback function change.
 *
 * @param fn The computation function.
 * @returns A new read-only signal.
 */
function computed<T>(fn: () => T): ReadonlySignal<T> {
  return new Computed(fn);
}

/**
 * Cleanup and dispose of an effect.
 */
function cleanupEffect(effect: Effect) {
  const cleanup = effect._cleanup;
  effect._cleanup = undefined;

  if (typeof cleanup === "function") {
    startBatch();

    // Run cleanup functions always outside of any context.
    const prevContext = evalContext;
    evalContext = undefined;

    try {
      cleanup();
    } catch (err) {
      effect._flags &= ~RUNNING;
      effect._flags |= DISPOSED;
      disposeEffect(effect);
      throw err;
    } finally {
      evalContext = prevContext;
      endBatch();
    }
  }
}

/**
 * Completely dispose of an effect and all its resources.
 */
function disposeEffect(effect: Effect) {
  for (let node = effect._sources; node !== undefined;) {
    const nextNode = node._nextSource; // Store next before unsubscribing
    node._source._unsubscribe(node);
    // Return nodes to the pool
    recycleNode(node);
    node = nextNode;
  }

  effect._fn = undefined;
  effect._sources = undefined;

  // Only clean up if there's a cleanup function
  if (effect._cleanup) {
    cleanupEffect(effect);
  }
}

/**
 * End an effect evaluation, clean up sources and handle disposal if needed.
 */
function endEffect(this: Effect, prevContext?: Computed | Effect) {
  if (evalContext !== this) {
    throw new Error("Out-of-order effect evaluation detected");
  }
  cleanupSources(this);
  evalContext = prevContext;

  this._flags &= ~RUNNING;
  if (this._flags & DISPOSED) {
    disposeEffect(this);
  }
  endBatch();
}

type EffectFn = NoneToVoidFunction | NoneToVoidFunction;
type CleanupEffectFn = NoneToVoidFunction;

/**
 * An effect that runs when its dependencies change.
 */
declare class Effect {
  _fn?: EffectFn;
  _cleanup?: NoneToVoidFunction;
  _sources?: Node;
  _nextBatchedEffect?: Effect;
  _flags: number;

  constructor(fn: EffectFn);

  _callback(): void;
  _start(): CleanupEffectFn;
  _notify(): void;
  _dispose(): void;
}

function Effect(this: Effect, fn: EffectFn) {
  this._fn = fn;
  this._cleanup = undefined;
  this._sources = undefined;
  this._nextBatchedEffect = undefined;
  this._flags = TRACKING;
}

Effect.prototype._callback = function () {
  const finish = this._start();

  try {
    if (this._flags & DISPOSED) return;
    if (this._fn === undefined) return;

    const cleanup = this._fn();

    if (typeof cleanup === "function") {
      // Clean up previous function if it exists
      if (this._cleanup) {
        try {
          this._cleanup();
        } catch (err) {
          console.error("Error in effect cleanup:", err);
        }
      }
      this._cleanup = cleanup;
    }
  } finally {
    finish();
  }
};

Effect.prototype._start = function () {
  if (this._flags & RUNNING) {
    throw new Error("Cycle detected in effect dependencies");
  }

  this._flags |= RUNNING;
  this._flags &= ~DISPOSED;

  cleanupEffect(this);
  prepareSources(this);

  startBatch();
  const prevContext = evalContext;
  evalContext = this;

  return endEffect.bind(this, prevContext);
};

Effect.prototype._notify = function () {
  if (!(this._flags & NOTIFIED)) {
    this._flags |= NOTIFIED;
    this._nextBatchedEffect = batchedEffect;
    batchedEffect = this;
  }
};

Effect.prototype._dispose = function () {
  this._flags |= DISPOSED;

  if (!(this._flags & RUNNING)) {
    disposeEffect(this);
  }
};

/**
 * Create an effect to run arbitrary code in response to signal changes.
 *
 * The effect tracks which signals are accessed in the given callback
 * function `fn`, and re-runs the callback when those signals change.
 *
 * The callback function can return a cleanup function. The cleanup function
 * is run once, either before the next callback invocation or when the effect is
 * disposed, whichever comes first.
 *
 * @param fn The effect callback.
 * @returns A function for disposing the effect.
 */
function effect(fn: EffectFn): NoneToVoidFunction {
  const effect = new Effect(fn);

  try {
    effect._callback();
  } catch (err) {
    effect._dispose();
    throw err;
  }
  // Return the bound function instead of a wrapper like `() => effect._dispose()`,
  // because bound functions seem to be just as fast and take much less memory.
  return effect._dispose.bind(effect);
}

type Signalify<T> = {
  [K in keyof T]: T[K] extends object
  ? Signal<T[K] extends Array<infer U> ? Signalify<U>[] : Signalify<T[K]>>
  : Signal<T[K]>;
};

type CursorCallback = (path: (string | number)[], value: any) => void;

function isPlainObject(value: any): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function makeReactiveArray<T>(
  arr: T[],
  callback: CursorCallback,
  path: (string | number)[],
): Signal<Signalify<T>[]> {
  const reactiveItems = arr.map((item, index) =>
    isPlainObject(item)
      ? reactiveObject(item as any, callback, [...path, index])
      : item,
  );

  const sig = signal(reactiveItems as Signalify<T>[]);

  effect(() => {
    const current = sig.value;
    callback(path, current);
  });

  const proxy = new Proxy(sig.value, {
    set(target, prop, value) {
      const index = Number(prop);
      if (!isNaN(index)) {
        if (isPlainObject(value)) {
          value = reactiveObject(value, callback, [...path, index]);
        }
      }

      (target as any)[prop] = value;

      sig.value = structuredClone(target)
      return true;
    },
    deleteProperty(target, prop) {
      const index = Number(prop);
      if (!isNaN(index)) {
        target.splice(index, 1);
        sig.value = [...target];
        return true;
      }
      return false;
    },
  });

  sig.value = proxy as any;

  return sig;
}

export function reactiveObject<T extends object>(
  obj: T,
  callback?: CursorCallback,
  path: (string | number)[] = [],
): Signalify<T> {
  const reactive = {} as Signalify<T>;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const currentPath = [...path, key];
    const value = obj[key];

    const wrapAndTrack = (v: any, p: (string | number)[]) => {
      const sig = signal(v);
      if (callback) {
        effect(() => {
          callback(p, sig.peek());
        });
      }
      return sig;
    };

    if (Array.isArray(value)) {
      reactive[key] = makeReactiveArray(value, callback!, currentPath) as any;
    } else if (isPlainObject(value)) {
      const nested = reactiveObject(value, callback, currentPath);
      reactive[key] = wrapAndTrack(nested, currentPath) as any;
    } else {
      reactive[key] = wrapAndTrack(value, currentPath) as any;
    }
  }

  return reactive;
}

/**
 * Execute a callback function in a try-catch block and handle errors
 * without disrupting the reactive system
 *
 * @param fn The function to execute safely
 * @param errorHandler Optional error handler
 * @returns The result of fn or undefined if an error occurred
 */
export function safeExecute<T>(
  fn: () => T,
  errorHandler?: (error: unknown) => void,
): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.error("Error in reactive system:", error);
    }
    return undefined;
  }
}

/**
 * Watch for changes in a value without creating an effect
 * Can be used for debugging or logging
 *
 * @param sig The signal to watch
 * @param callback The callback to run when the value changes
 * @returns A function to stop watching
 */
export function watch<T>(
  sig: Signal<T> | ReadonlySignal<T>,
  callback: (value: T, prev: T | undefined) => void,
): NoneToVoidFunction {
  let prev = sig.peek();

  return effect(() => {
    const current = sig.value;
    if (!Object.is(current, prev)) {
      try {
        callback(current, prev);
      } finally {
        prev = current;
      }
    }
  });
}

/**
 * Performance monitoring function to track signal updates
 * Use in development only
 */
export function monitorSignals(enable: boolean): void {
  if (!enable) {
    // Remove any monitoring hooks
    return;
  }

  // Store original methods
  const originalSignalSet = Object.getOwnPropertyDescriptor(
    Signal.prototype,
    "value",
  )!.set!;
  const originalComputedRefresh = Computed.prototype._refresh;

  // Override signal setter to track updates
  Object.defineProperty(Signal.prototype, "value", {
    set(value) {
      console.log(`Signal updated: ${String(value)}`);
      originalSignalSet.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Signal.prototype, "value")!.get,
  });

  // Override computed refresh to track recomputation
  Computed.prototype._refresh = function () {
    console.log("Computed refreshing");
    return originalComputedRefresh.call(this);
  };
}

export {
  computed,
  effect,
  batch,
  untracked,
  Signal,
  Computed,
  Effect,
  SIGNAL_SYMBOL,
  type ReadonlySignal,
  type Signalify,
};
