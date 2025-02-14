import { MAX_INT32 } from "../math";

const SIGNAL_SYMBOL = Symbol.for("awe_signals");

function incrementVersion(version: number): number {
  return version === MAX_INT32 ? 1 : version + 1;
}

// Flags for Computed and Effect.
const RUNNING = 1 << 0; // 1
const NOTIFIED = 1 << 1; // 2
const OUTDATED = 1 << 2; // 4
const DISPOSED = 1 << 3; // 8
const HAS_ERROR = 1 << 4; // 16
const TRACKING = 1 << 5; // 32

enum EVersion {
  NotUsed = -1,
  Current = 0,
}

type Node = {
  _source: Signal<any>;
  _prevSource?: Node;
  _nextSource?: Node;
  _target: Computed<any> | Effect<any>;
  _prevTarget?: Node;
  _nextTarget?: Node;
  _version: number;
  _rollbackNode?: Node;
};

let evalContext: Computed<any> | Effect<any> | undefined = undefined;
let batchedEffect: Effect<any> | undefined = undefined;
let batchDepth = 0;
let batchIteration = 0;
let globalVersion = 0;

function startBatch() {
  batchDepth++;
}

function endBatch() {
  if (batchDepth > 1) {
    batchDepth--;
    return;
  }

  let error: unknown;
  let hasError = false;

  while (batchedEffect !== undefined) {
    let effect: Effect<any> | undefined = batchedEffect;
    batchedEffect = undefined;
    batchIteration++;

    while (effect !== undefined) {
      const next: Effect<any> | undefined = effect._nextBatchedEffect;
      effect._nextBatchedEffect = undefined;
      effect._flags &= ~NOTIFIED;

      if (!(effect._flags & DISPOSED) && needsToRecompute(effect)) {
        try {
          effect._callback();
        } catch (err) {
          if (!hasError) {
            error = err;
            hasError = true;
          }
        }
      }

      effect = next;
    }
  }

  batchIteration = 0;
  batchDepth--;

  if (hasError) {
    throw error;
  }
}

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

function untracked<T>(fn: () => T): T {
  const prevContext = evalContext;
  evalContext = undefined;
  try {
    return fn();
  } finally {
    evalContext = prevContext;
  }
}

function addDependency(signal: Signal<any>): Node | undefined {
  if (evalContext === undefined) {
    return undefined;
  }

  let node = signal._node;

  if (node === undefined || node._target !== evalContext) {
    node = {
      _version: EVersion.Current,
      _source: signal,
      _prevSource: evalContext._sources,
      _nextSource: undefined,
      _target: evalContext,
      _prevTarget: undefined,
      _nextTarget: undefined,
      _rollbackNode: node,
    };

    if (evalContext._sources !== undefined) {
      evalContext._sources._nextSource = node;
    }

    evalContext._sources = node;
    signal._node = node;

    if (evalContext._flags & TRACKING) {
      signal._subscribe(node);
    }

    return node;
  } else if (node._version === EVersion.NotUsed) {
    node._version = EVersion.Current;

    if (node._nextSource !== undefined) {
      node._nextSource._prevSource = node._prevSource;
      if (node._prevSource !== undefined) {
        node._prevSource._nextSource = node._nextSource;
      }

      node._prevSource = evalContext._sources;
      node._nextSource = undefined;
      evalContext._sources!._nextSource = node;
      evalContext._sources = node;
    }

    return node;
  }

  return undefined;
}

abstract class BaseSignal<T = any> {
  public _value: T;
  public _version: number;
  public _node?: Node;
  public _targets?: WeakRef<Node>;

  constructor(value?: T) {
    this._value = value ?? ({} as T);
    this._version = EVersion.Current;
  }

  public _refresh(): boolean {
    return true;
  }

  public _subscribe(node: Node): void {
    if (this._targets?.deref() !== node && node._prevTarget === undefined) {
      node._nextTarget = this._targets?.deref()!;
      if (this._targets !== undefined) {
        this._targets.deref()!._prevTarget = node;
      }
      this._targets = new WeakRef(node);
    }
  }

  public _unsubscribe(node: Node): void {
    if (this._targets !== undefined) {
      const prev = node._prevTarget;
      const next = node._nextTarget;

      if (prev !== undefined) prev._nextTarget = next;
      if (next !== undefined) next._prevTarget = prev;

      if (node === this._targets.deref()) this._targets = undefined;

      node._prevTarget = node._nextTarget = undefined;
    }
  }

  subscribe(fn: (value: T) => void): () => void {
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
  }

  valueOf(): T {
    return this.value;
  }

  toString(): string {
    return this.value + "";
  }

  toJSON(): T {
    return this.value;
  }

  peek(): T {
    const prevContext = evalContext;
    evalContext = undefined;
    try {
      return this.value;
    } finally {
      evalContext = prevContext;
    }
  }

  get value(): T {
    const node = addDependency(this);
    if (node) node._version = this._version;
    return this._value;
  }

  set value(value: T) {
    if (value === this._value) return;

    if (batchIteration > 100) throw new Error("Cycle detected");

    this._value = value;
    this._version = incrementVersion(this._version);
    globalVersion = incrementVersion(globalVersion);

    startBatch();
    try {
      let node = this._targets?.deref();
      while (node) {
        node._target._notify();
        node = node._nextTarget;
      }
    } finally {
      endBatch();
    }
  }
}

class Signal<T> extends BaseSignal<T> {}

class Computed<T> extends BaseSignal<T> {
  public _fn: () => T;
  public _sources?: Node;
  public _globalVersion: number;
  public _flags: number;

  constructor(fn: () => T) {
    super();
    this._fn = fn;
    this._sources = undefined;
    this._globalVersion = globalVersion - 1;
    this._flags = OUTDATED;
  }

  public _notify(): void {
    if (!(this._flags & NOTIFIED)) {
      this._flags |= OUTDATED | NOTIFIED;

      let node = this._targets?.deref();
      while (node) {
        node._target._notify();
        node = node._nextTarget;
      }
    }
  }

  public _refresh(): boolean {
    this._flags &= ~NOTIFIED;

    if (this._flags & RUNNING) {
      return false;
    }

    if ((this._flags & (OUTDATED | TRACKING)) === TRACKING) {
      return true;
    }

    this._flags &= ~OUTDATED;

    if (this._globalVersion === globalVersion) {
      return true;
    }

    this._globalVersion = globalVersion;

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
        this._value !== value ||
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
    } finally {
      evalContext = prevContext;
      cleanupSources(this);
      this._flags &= ~RUNNING;
    }

    return true;
  }

  public _subscribe(node: Node): void {
    if (this._targets === undefined) {
      this._flags |= OUTDATED | TRACKING;

      let sourceNode = this._sources;
      while (sourceNode) {
        sourceNode._source._subscribe(sourceNode);
        sourceNode = sourceNode._nextSource;
      }
    }

    super._subscribe(node);
  }

  public _unsubscribe(node: Node): void {
    if (this._targets !== undefined) {
      super._unsubscribe(node);

      if (this._targets === undefined) {
        this._flags &= ~TRACKING;

        let sourceNode = this._sources;
        while (sourceNode) {
          sourceNode._source._unsubscribe(sourceNode);
          sourceNode = sourceNode._nextSource;
        }
      }
    }
  }
}

function computed<T>(fn: () => T): Readonly<Signal<T>> {
  return new Computed(fn);
}

class Effect<T> {
  public _fn?: () => T | (() => void);
  public _cleanup?: () => void;
  public _sources?: Node;
  public _nextBatchedEffect?: Effect<any>;
  public _flags: number;

  constructor(fn: () => T | (() => void)) {
    this._fn = fn;
    this._cleanup = undefined;
    this._sources = undefined;
    this._nextBatchedEffect = undefined;
    this._flags = TRACKING;
  }

  public _callback(): void {
    const finish = this._start();
    try {
      if (this._flags & DISPOSED) return;
      if (this._fn === undefined) return;

      const cleanup = this._fn();
      if (typeof cleanup === "function") {
        this._cleanup = cleanup;
      }
    } finally {
      finish();
    }
  }

  public _start(): () => void {
    if (this._flags & RUNNING) {
      throw new Error("Cycle detected");
    }

    this._flags |= RUNNING;
    this._flags &= ~DISPOSED;

    cleanupEffect(this);
    prepareSources(this);

    startBatch();
    const prevContext = evalContext;
    evalContext = this;

    return () => {
      if (evalContext !== this) {
        throw new Error("Out-of-order effect");
      }

      cleanupSources(this);
      evalContext = prevContext;
      this._flags &= ~RUNNING;

      if (this._flags & DISPOSED) {
        disposeEffect(this);
      }

      endBatch();
    };
  }

  public _notify(): void {
    if (!(this._flags & NOTIFIED)) {
      this._flags |= NOTIFIED;
      this._nextBatchedEffect = batchedEffect;
      batchedEffect = this;
    }
  }

  public _dispose(): void {
    this._flags |= DISPOSED;

    if (!(this._flags & RUNNING)) {
      disposeEffect(this);
    }
  }
}

function effect<T>(fn: () => T | (() => void)): () => void {
  const effectInstance = new Effect(fn);

  try {
    effectInstance._callback();
  } catch (err) {
    effectInstance._dispose();
    throw err;
  }

  return effectInstance._dispose.bind(effectInstance);
}

function needsToRecompute(target: Computed<any> | Effect<any>): boolean {
  for (
    let node = target._sources;
    node !== undefined;
    node = node._nextSource
  ) {
    const source = node._source;

    if (
      source._version !== node._version ||
      !source._refresh() ||
      source._version !== node._version
    ) {
      return true;
    }
  }

  return false;
}

function prepareSources(target: Computed<any> | Effect<any>): void {
  let currentNode = target._sources;

  while (currentNode) {
    const sourceNode = currentNode._source._node;
    if (sourceNode !== undefined) {
      currentNode._rollbackNode = sourceNode;
    }

    currentNode._source._node = currentNode;
    currentNode._version = EVersion.NotUsed;

    if (currentNode._nextSource === undefined) {
      target._sources = currentNode;
      break;
    }

    currentNode = currentNode._nextSource;
  }
}

function cleanupSources(target: Computed<any> | Effect<any>): void {
  let currentNode = target._sources;
  let newHead: Node | undefined = undefined;

  while (currentNode !== undefined) {
    const previousNode = currentNode._prevSource;

    if (currentNode._version === EVersion.NotUsed) {
      currentNode._source._unsubscribe(currentNode);

      if (previousNode !== undefined) {
        previousNode._nextSource = currentNode._nextSource;
      }

      if (currentNode._nextSource !== undefined) {
        currentNode._nextSource._prevSource = previousNode;
      }
    } else {
      newHead = currentNode;
    }

    currentNode._source._node = currentNode._rollbackNode;
    currentNode._rollbackNode = undefined;

    currentNode = previousNode;
  }

  target._sources = newHead;
}

function cleanupEffect(effect: Effect<any>): void {
  const cleanup = effect._cleanup;
  effect._cleanup = undefined;

  if (typeof cleanup === "function") {
    startBatch();
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

function disposeEffect(effect: Effect<any>): void {
  let node = effect._sources;

  while (node) {
    node._source._unsubscribe(node);
    node = node._nextSource;
  }

  effect._fn = undefined;
  effect._sources = undefined;
  cleanupEffect(effect);
}

function createProxy<T>(obj: T): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (value instanceof Signal) {
        return value.value;
      } else if (typeof value === "object" && value !== null) {
        return createProxy(value);
      }

      return value;
    },
    set(target, prop, value, receiver) {
      const current = Reflect.get(target, prop, receiver);

      if (current instanceof Signal) {
        current.value = value;
        return true;
      }

      return Reflect.set(target, prop, value, receiver);
    },
  };

  return new Proxy(obj, handler);
}

function reactiveObject<T>(obj: T): T {
  const reactive: any = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];
      reactive[key] =
        typeof value === "object" && value !== null
          ? reactiveObject(value)
          : new Signal(value);
    }
  }

  return createProxy(reactive);
}

export {
  computed,
  effect,
  batch,
  untracked,
  reactiveObject,
  type Signal,
  type ISignalObject,
};
