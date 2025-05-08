import { PathSegment, createPathMatcher } from "../private/PathMatcher";
import { PathSyntaxError } from "../private/PathSyntaxError";

/**
 * Symbol used to identify signals across the system.
 * Using Symbol.for ensures consistency across modules.
 */
const SIGNAL_SYMBOL = Symbol.for("signals");

/**
 * Pool of reusable SignalNode instances to reduce garbage collection pressure.
 * Nodes are recycled when no longer needed instead of being created anew.
 */
const NODE_POOL: SignalNode[] = [];
const MAX_POOL_SIZE = 1000;

// Config constants with documentation
/**
 * Maximum number of batch iterations allowed before assuming an infinite loop.
 * This prevents the system from freezing when signals form circular update patterns.
 */
const MAX_BATCH_ITERATIONS = 1000;

/**
 * Maximum recursion depth for signal evaluation to prevent stack overflow errors.
 * If signal evaluations nest deeper than this limit, an error is thrown.
 */
const MAX_RECURSION_DEPTH = 100;

/**
 * Increments version number safely, handling overflow by cycling back to 1.
 * Uses 1 instead of 0 because 0 is a special value (CURRENT_VERSION).
 *
 * @param version - Current version number
 * @returns Incremented version number
 */
function incrementVersion(version: number): number {
  return version >= Number.MAX_SAFE_INTEGER - 1 ? 1 : version + 1;
}

/**
 * Signal identity tracking registry that maps signals to their debug names.
 * Uses WeakMap to avoid memory leaks - signals can be garbage collected.
 */
const signalRegistry = new WeakMap<Signal, string>();

/**
 * Signal path tracking for debugging and error reporting.
 * Maps signals to their dependency paths.
 */
const signalPaths = new WeakMap<Signal | Computed | Effect, string[]>();

// Flags for Computed and Effect with clear documentation.
/**
 * RUNNING: Signal is currently being evaluated
 */
const RUNNING = 1 << 0; // 1

/**
 * NOTIFIED: Signal is scheduled for update in the current batch
 */
const NOTIFIED = 1 << 1; // 2

/**
 * OUTDATED: Signal's value needs to be recomputed
 */
const OUTDATED = 1 << 2; // 4

/**
 * DISPOSED: Signal has been disposed and should not be used
 */
const DISPOSED = 1 << 3; // 8

/**
 * HAS_ERROR: Signal evaluation resulted in an error
 */
const HAS_ERROR = 1 << 4; // 16

/**
 * TRACKING: Signal is tracking its dependencies
 */
const TRACKING = 1 << 5; // 32

/**
 * DEBUG_MODE: Signal has enhanced debugging enabled
 */
const DEBUG_MODE = 1 << 6; // 64

/**
 * Special version values used in the system.
 */
enum EVersion {
  NotUsed = -1, // SignalNode is not reused (marks potentially unused but reusable nodes)
  Current = 0, // Current active version
}

/**
 * Type alias for any function
 */
type AnyFunction = (...args: any[]) => any;

/**
 * SignalNode in a linked list, used to track dependencies (sources) and dependents (targets).
 * Each node represents a connection between a source signal and a target (computed or effect).
 * The linked lists allow efficient traversal of dependencies and dependents.
 */
type SignalNode = {
  // Source signal that the target depends on
  _source: Signal;
  _prevSource?: SignalNode;
  _nextSource?: SignalNode;

  // Target that depends on the source and should be notified when the source changes
  _target: Computed | Effect;
  _prevTarget?: SignalNode;
  _nextTarget?: SignalNode;

  // Version number of the source that the target last saw
  _version: number;

  // Used to remember and rollback previous value of ._node
  _rollbackSignalNode?: SignalNode;

  // Used to store the hash of the node for debugging purposes or comparison
  // to check if the node has changed
  _hash?: string;
};

/**
 * Get a node from the pool or create a new one.
 * This reduces garbage collection pressure by reusing nodes.
 */
function getSignalNode(): SignalNode {
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
    _rollbackSignalNode: undefined,
  } as SignalNode;
}

/**
 * Return a node to the pool for reuse.
 * Clears all references to avoid memory leaks.
 *
 * @param node - The SignalNode to recycle
 */
function recycleSignalNode(node: SignalNode): void {
  // Clear references to help GC
  node._source = undefined!;
  node._prevSource = undefined;
  node._nextSource = undefined;
  node._target = undefined!;
  node._prevTarget = undefined;
  node._nextTarget = undefined;
  node._rollbackSignalNode = undefined;

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

/**
 * Starts a new batch operation.
 * Batching coalesces multiple signal updates into a single notification cycle.
 */
function startBatch() {
  batchDepth++;
}

/**
 * Ends the current batch operation and processes all pending effects.
 * This is where the actual work of updating computed values and running effects happens.
 * @throws Error if maximum batch iterations are exceeded or if effect callbacks throw
 */
function endBatch() {
  if (batchDepth > 1) {
    batchDepth--;
    return;
  }

  const errors: Array<{
    effect: Effect;
    error: unknown;
    stack?: string;
    path?: string[];
  }> = [];

  try {
    while (batchedEffect !== undefined) {
      let effect: Effect | undefined = batchedEffect;
      batchedEffect = undefined;

      batchIteration++;

      // Safety check to prevent infinite loops
      if (batchIteration > MAX_BATCH_ITERATIONS) {
        throw new Error(
          `Maximum batch iteration limit reached (${MAX_BATCH_ITERATIONS}). Possible infinite loop detected in effect chain.`,
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
            // Enhanced error reporting with effect path info
            const path = signalPaths.get(effect);
            errors.push({
              effect,
              error: err,
              stack: err instanceof Error ? err.stack : undefined,
              path,
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

  // Enhanced error handling with path information
  if (errors.length === 1) {
    const { error, path } = errors[0];
    if (error instanceof Error && path) {
      error.message = `Error in effect${path ? ` [${path.join(" → ")}]` : ""}: ${error.message}`;
    }
    throw error;
  } else if (errors.length > 0) {
    const enhancedErrors = errors.map(({ error, path }) => {
      if (error instanceof Error && path) {
        error.message = `Error in effect${path ? ` [${path.join(" → ")}]` : ""}: ${error.message}`;
      }
      return error;
    });

    throw new AggregateError(
      enhancedErrors,
      `${errors.length} errors occurred during batch processing`,
    );
  }
}

/**
 * Batch multiple signal value updates into a single "commit" at the end of the provided callback.
 *
 * Batches can be nested, and changes are flushed only after the outermost batch's callback completes.
 * Accessing a signal that was changed in a batch will reflect its updated value.
 *
 * @param fn - The callback function.
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
 * This is useful when you want to read a signal's value without creating a dependency.
 *
 * @param fn - The callback function.
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
 * to prevent stack overflows.
 * @throws Error if maximum recursion depth is exceeded
 */
function checkRecursionDepth(): void {
  if (++recursionDepth > MAX_RECURSION_DEPTH) {
    // Enhanced error message with context path
    let contextPath = "";
    if (evalContext) {
      const path = signalPaths.get(evalContext);
      if (path) {
        contextPath = ` in ${path.join(" → ")}`;
      }
    }

    throw new Error(
      `Maximum recursion depth exceeded (${MAX_RECURSION_DEPTH})${contextPath}. Possible infinite recursion detected.`,
    );
  }
}

/**
 * Adds a dependency between the current evaluation context and the provided signal.
 * Returns the dependency node or undefined if there's no current context.
 *
 * @param signal - The signal to add as a dependency
 * @returns The SignalNode representing the dependency or undefined
 */
function addDependency(signal: Signal): SignalNode | undefined {
  if (evalContext === undefined) {
    return undefined;
  }

  checkRecursionDepth();

  let node = signal._node;

  if (node === undefined || node._target !== evalContext) {
    // This is a new dependency. Create a new node and set it as
    // the tail of the current context's dependency list.
    node = getSignalNode();
    node._version = EVersion.Current;
    node._source = signal;
    node._prevSource = evalContext._sources;
    node._nextSource = undefined;
    node._target = evalContext;
    node._prevTarget = undefined;
    node._nextTarget = undefined;
    node._rollbackSignalNode = signal._node;

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

    if (DEBUG_MODE) {
      const sourceName = signalRegistry.get(signal) || "anonymous";
      const targetPath = signalPaths.get(evalContext) || [];
      if (!targetPath.includes(sourceName)) {
        signalPaths.set(evalContext, [...targetPath, sourceName]);
      }
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
 *
 * @param target - The computed or effect to check
 * @returns true if the target needs to recompute, false otherwise
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
 *
 * @param target - The computed or effect being prepared
 */
function prepareSources(target: Computed | Effect) {
  let currentSignalNode = target._sources;

  // Clear sources if there aren't any
  if (currentSignalNode === undefined) {
    return;
  }

  while (currentSignalNode !== undefined) {
    const sourceSignalNode = currentSignalNode._source._node;

    if (sourceSignalNode !== undefined) {
      currentSignalNode._rollbackSignalNode = sourceSignalNode;
    }

    // Mark the source node as the current node
    currentSignalNode._source._node = currentSignalNode;

    // Mark the node as reusable
    currentSignalNode._version = EVersion.NotUsed;

    // If this is the end of the list, update target._sources
    if (currentSignalNode._nextSource === undefined) {
      target._sources = currentSignalNode;
      break;
    }

    currentSignalNode = currentSignalNode._nextSource;
  }
}

/**
 * Cleans up sources after evaluation, removing unused dependencies
 * and restoring node state.
 *
 * @param target - The computed or effect being cleaned up
 */
function cleanupSources(target: Computed | Effect) {
  let currentSignalNode = target._sources;
  let newHead = undefined;

  while (currentSignalNode !== undefined) {
    const previousSignalNode = currentSignalNode._prevSource;

    // SignalNode wasn't reused, unsubscribe and remove it from the list
    if (currentSignalNode._version === EVersion.NotUsed) {
      currentSignalNode._source._unsubscribe(currentSignalNode);

      if (previousSignalNode !== undefined) {
        previousSignalNode._nextSource = currentSignalNode._nextSource;
      }

      if (currentSignalNode._nextSource !== undefined) {
        currentSignalNode._nextSource._prevSource = previousSignalNode;
      }

      // Restore original node state before recycling
      const nodeToRecycle = currentSignalNode;
      currentSignalNode._source._node = currentSignalNode._rollbackSignalNode;

      if (currentSignalNode._rollbackSignalNode !== undefined) {
        currentSignalNode._rollbackSignalNode = undefined;
      }

      // Only recycle after using its properties
      recycleSignalNode(nodeToRecycle);
    } else {
      // Keep track of the new head (last non-removed node)
      newHead = currentSignalNode;

      // Restore original node state
      currentSignalNode._source._node = currentSignalNode._rollbackSignalNode;

      if (currentSignalNode._rollbackSignalNode !== undefined) {
        currentSignalNode._rollbackSignalNode = undefined;
      }
    }

    // Move to the previous node
    currentSignalNode = previousSignalNode;
  }

  target._sources = newHead;
}

/**
 * Validates a value for use in a signal.
 * Checks for problematic values and provides warnings.
 *
 * @param value - The value to validate
 * @param signalName - Optional name of the signal for better error messages
 * @returns true if valid, false if potentially problematic
 */
function validateSignalValue(value: unknown, signalName?: string): boolean {
  // Special handling for NaN values
  if (typeof value === "number" && isNaN(value)) {
    console.warn(
      `Warning: Signal${signalName ? ` "${signalName}"` : ""} set to NaN, which may cause unexpected behavior`,
    );
    return false;
  }

  // Warning for function values (often accidental)
  if (typeof value === "function") {
    console.warn(
      `Warning: Signal${signalName ? ` "${signalName}"` : ""} set to a function value. This might be unintentional.`,
    );
    return false;
  }

  return true;
}

/**
 * Base class for signals (both simple and computed).
 */
declare class Signal<T = any> {
  /** @internal The current value of the signal */
  _value: unknown;

  /**
   * @internal
   * Version numbers must always be >= 0, as the special value -1 is used by
   * nodes to mark potentially unused but reusable nodes.
   */
  _version: number;

  /** @internal Current dependency node */
  _node?: SignalNode;

  /** @internal List of dependents (computed signals or effects) */
  _targets?: SignalNode;

  /** @internal Debug flag */
  _debug: boolean;

  constructor(value?: T, name?: string);

  /** @internal Refresh the signal's value if needed */
  _refresh(): boolean;

  /** @internal Subscribe a dependent to this signal */
  _subscribe(node: SignalNode): void;

  /** @internal Unsubscribe a dependent from this signal */
  _unsubscribe(node: SignalNode): void;

  /** @internal Notify all dependents of a change */
  _notifyDependencies(): void;

  /**
   * Subscribe to this signal's changes
   * @param fn Function to call when the signal changes
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

  /**
   * Set a debug name for this signal
   * @param name The name to identify this signal in debugging
   * @returns this signal (for chaining)
   */
  withName(name: string): Signal<T>;

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
function Signal(this: Signal, value?: unknown, name?: string) {
  this._value = value;
  this._version = EVersion.Current;
  this._node = undefined;
  this._targets = undefined;
  this._debug = false;

  // Register with name if provided
  if (name) {
    signalRegistry.set(this, name);
    signalPaths.set(this, [name]);
  }
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
  let currentSignalNode = this._targets;

  while (currentSignalNode !== undefined) {
    const nextSignalNode = currentSignalNode._nextTarget; // Store next before notifying in case of changes
    currentSignalNode._target._notify();
    currentSignalNode = nextSignalNode;
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

/**
 * Sets a debug name for this signal for better error messages and debugging
 */
Signal.prototype.withName = function (name: string) {
  signalRegistry.set(this, name);
  signalPaths.set(this, [name]);
  return this;
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
    // Validate the value before setting
    const signalName = signalRegistry.get(this);
    validateSignalValue(value, signalName);

    if (this._value !== value) {
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
        const signalName = signalRegistry.get(this) || "anonymous";
        throw new Error(
          `Cycle detected in signal updates (signal: ${signalName})`,
        );
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
    }
  },
});

/**
 * Create a new plain signal.
 *
 * @param value - The initial value for the signal.
 * @param name - Optional name for debugging purposes
 * @returns A new signal.
 */
export function signal<T>(value: T): Signal<T>;
export function signal<T = undefined>(): Signal<T | undefined>;
export function signal<T>(
  valueOrName?: T | string,
  maybeNameOrUndefined?: string,
): Signal<T> {
  let initialValue: T | undefined;
  let name: string | undefined;

  if (typeof valueOrName === "string" && maybeNameOrUndefined === undefined) {
    name = valueOrName as string;
    initialValue = undefined as unknown as T;
  } else {
    // Called as signal(value) or signal(value, name)
    initialValue = valueOrName as T;
    name = maybeNameOrUndefined;
  }

  return new Signal(initialValue, name);
}

/**
 * A computed signal that derives its value from other signals.
 */
declare class Computed<T = any> extends Signal<T> {
  _fn: () => T;
  _sources?: SignalNode;
  _globalVersion: number;
  _flags: number;
  _lastGlobalVersion: number; // Track the last seen global version for optimizations

  constructor(fn: () => T, name?: string);

  _notify(): void;
  get value(): T;
}

function Computed(this: Computed, fn: () => unknown, name?: string) {
  Signal.call(this, undefined);

  this._fn = fn;
  this._sources = undefined;
  this._globalVersion = globalVersion - 1;
  this._lastGlobalVersion = 0;
  this._flags = OUTDATED;

  // Register with name if provided
  if (name) {
    signalRegistry.set(this, name);
    signalPaths.set(this, [name]);
  }
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

    let currentSignalNode = this._targets;
    while (currentSignalNode !== undefined) {
      const nextSignalNode = currentSignalNode._nextTarget; // Store next before notifying
      currentSignalNode._target._notify();
      currentSignalNode = nextSignalNode;
    }
  }
};

Object.defineProperty(Computed.prototype, "value", {
  get(this: Computed) {
    if (this._flags & RUNNING) {
      const name = signalRegistry.get(this) || "computed";
      const path = signalPaths.get(this) || [];
      const pathStr = path.length > 0 ? ` in path [${path.join(" → ")}]` : "";

      throw new Error(
        `Cycle detected in computed dependencies: ${name}${pathStr}`,
      );
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
  withName(name: string): ReadonlySignal<T>;
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
    const nextSignalNode = node._nextSource; // Store next before unsubscribing
    node._source._unsubscribe(node);
    // Return nodes to the pool
    recycleSignalNode(node);
    node = nextSignalNode;
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

type EffectFn = NoneToVoidFunction;
type CleanupEffectFn = NoneToVoidFunction;

/**
 * An effect that runs when its dependencies change.
 */
declare class Effect {
  _fn?: EffectFn;
  _cleanup?: NoneToVoidFunction;
  _sources?: SignalNode;
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
  [K in keyof T]: T[K] extends Array<infer U>
  ? Signal<Signalify<U>[]>
  : T[K] extends object
  ? Signal<Signalify<T[K]>>
  : Signal<T[K]>;
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type CursorCallback = (path: (string | number)[], value: unknown) => void;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// {
//   root: {
//     child {
//       left: {
//         ...elements
//       },
//       right: {
//         a: 1
//         b: [0, 1, 2, 3] < --only this part of the tree change triggers and change tracking, the left remains unchanged
//       }
//     }
//   }
// }

export interface ReactiveOptions {
  /** Callback for tracking changes at specific paths */
  callback?: CursorCallback;
  /** Current path in the object tree (default: []) */
  path?: (string | number)[];
  /** Glob patterns for selective tracking (default: ["**"]) */
  trackPatterns?: string[];
}

/**
 * Creates a reactive object with signals for tracked properties, using path patterns for selective reactivity.
 * @param obj - Input object to make reactive.
 * @param options - Configuration for reactivity.
 * @returns A reactive object with signals for properties.
 * @throws Error if trackPatterns are invalid.
 */
export function reactiveObject<T extends Record<string, unknown>>(
  obj: T,
  options: ReactiveOptions = {},
): Signalify<T> {
  const { callback, path = [], trackPatterns = ["**"] } = options;

  const matcher = createMatcher(trackPatterns);
  const reactive = {} as Signalify<T>;

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const currentPath = [...path, key];
    const value = obj[key];

    const createSignal = <V>(val: V): Signal<V> => {
      const sig = signal(val);
      if (callback && matcher(currentPath)) {
        effect(() => callback(currentPath, sig.peek()));
      }
      return sig;
    };

    if (Array.isArray(value)) {
      reactive[key] = makeReactiveArray(
        value,
        callback,
        currentPath,
        matcher,
      ) as Signalify<T>[typeof key];
    } else if (isPlainObject(value)) {
      const nested = reactiveObject(value as Record<string, unknown>, {
        callback,
        path: currentPath,
        trackPatterns,
      });
      reactive[key] = createSignal(nested) as Signalify<T>[typeof key];
    } else {
      reactive[key] = createSignal(value) as Signalify<T>[typeof key];
    }
  }

  return reactive;
}

/**
 * Creates a path matcher from patterns, with error handling.
 * @param patterns - Array of glob patterns.
 * @returns Matcher function for paths.
 * @throws Error for invalid patterns with fix tips.
 */
function createMatcher(patterns: string[]): (path: PathSegment[]) => boolean {
  try {
    return createPathMatcher(patterns);
  } catch (e) {
    if (e instanceof PathSyntaxError) {
      throw new Error(
        `Invalid track pattern: ${e.message}\nFix tips:\n${e.formatTips()}`,
      );
    }
    throw e;
  }
}

/**
 * Creates a reactive array with selective tracking.
 * @param arr - Input array to make reactive.
 * @param callback - Optional callback for tracking changes.
 * @param path - Current path in the object tree.
 * @param matcher - Path matcher for selective tracking.
 * @returns Signal wrapping a reactive array.
 */
function makeReactiveArray<T>(
  arr: T[],
  callback: CursorCallback | undefined,
  path: (string | number)[],
  matcher: (path: PathSegment[]) => boolean,
): Signal<T[]> {
  const reactiveItems = arr.map((item, index) => {
    const itemPath = [...path, index];

    const createSignal = <V>(val: V): Signal<V> => {
      const sig = signal(val);
      if (callback && matcher(itemPath)) {
        effect(() => callback(itemPath, sig.peek()));
      }
      return sig;
    };

    if (isPlainObject(item)) {
      return reactiveObject(item as Record<string, unknown>, {
        callback,
        path: itemPath,
        trackPatterns: ["**"],
      }) as T;
    }
    if (Array.isArray(item)) {
      return makeReactiveArray(item, callback, itemPath, matcher) as T;
    }
    return createSignal(item).value as T; // Unwrap signal for primitive values
  });

  const arraySignal = signal(reactiveItems as T[]);
  if (callback && matcher(path)) {
    effect(() => callback(path, arraySignal.peek()));
  }

  return arraySignal;
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

interface SharedWidnow extends Window {
  __originalSignalSet?: AnyFunction;
  __originalComputedRefresh?: AnyFunction;
}

// Ensure global storage for original methods
declare global {
  interface Window {
    __originalSignalSet?: AnyFunction;
    __originalComputedRefresh?: AnyFunction;
  }
}
/**
 * Performance monitoring function to track signal updates
 * Use in development only
 */
export function monitorSignals(enable: boolean): void {
  if (!enable) {
    // Restore original methods if stored
    if (window.__originalSignalSet) {
      Object.defineProperty(Signal.prototype, "value", {
        set: window.__originalSignalSet,
        get: Object.getOwnPropertyDescriptor(Signal.prototype, "value")!.get,
        configurable: true,
      });
      delete window.__originalSignalSet;
    }
    if (window.__originalComputedRefresh) {
      Computed.prototype._refresh = window.__originalComputedRefresh;
      delete window.__originalComputedRefresh;
    }
    return;
  }

  // Store original methods only if not already stored
  if (!window.__originalSignalSet) {
    window.__originalSignalSet = Object.getOwnPropertyDescriptor(
      Signal.prototype,
      "value",
    )!.set!;
  }
  if (!window.__originalComputedRefresh) {
    window.__originalComputedRefresh = Computed.prototype._refresh;
  }

  // Override signal setter to track updates
  Object.defineProperty(Signal.prototype, "value", {
    set(value) {
      console.log(`Signal updated: ${String(value)}`);
      (window as SharedWidnow).__originalSignalSet?.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Signal.prototype, "value")!.get,
    configurable: true,
  });

  // Override computed refresh to track recomputation
  Computed.prototype._refresh = function () {
    console.log("Computed refreshing");
    return (window as SharedWidnow).__originalComputedRefresh?.call(this);
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
  type DeepReadonly,
};
