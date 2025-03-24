import { throttleWith, throttle, debounce, Scheduler, IDisposable } from "@/lib/core";

export type TargetCallback = (entry: IntersectionObserverEntry) => void;
export type RootCallback = (entries: IntersectionObserverEntry[]) => void;
export type NoneToVoidFunction = () => void;

interface IIntersectionController {
  observer: IntersectionObserver;
  observe: (element: Element, callback: TargetCallback) => void;
  unobserve: (element: Element) => void;
  addCallback: (element: Element, callback: TargetCallback) => void;
  removeCallback: (element: Element, callback: TargetCallback) => void;
  flushEntries: NoneToVoidFunction;
  destroy: NoneToVoidFunction;
  freeze: NoneToVoidFunction;
  unfreeze: NoneToVoidFunction;
}

/**
 * A high-performance class that encapsulates IntersectionObserver logic for:
 * - Observing multiple elements with per-element callbacks.
 * - Optional throttling or debouncing of callbacks.
 * - Freezing/unfreezing observer updates with configurable entry discarding.
 * - Efficient resource management and browser-native performance.
 */
export class IntersectionController implements IIntersectionController, IDisposable {
  public observer: IntersectionObserver;

  // Map element → array of callbacks for better performance than CallbackManager
  private callbacks: WeakMap<Element, Set<TargetCallback>> = new WeakMap();
  private entriesAccumulator: Map<Element, IntersectionObserverEntry> = new Map();
  private freezeCount = 0;
  private onUnfreeze: NoneToVoidFunction | undefined;
  private observerCallback: NoneToVoidFunction;
  private discardWhileFrozen: boolean;
  private readonly rootCallback?: RootCallback;

  constructor(options: {
    root: Element | null;
    margin?: number;
    threshold?: number | number[];
    throttleMs?: number;
    throttleScheduler?: Scheduler;
    debounceMs?: number;
    shouldSkipFirst?: boolean;
    discardWhileFrozen?: boolean;
    rootCallback?: RootCallback;
  }) {
    const {
      root,
      margin,
      threshold,
      throttleMs,
      throttleScheduler,
      debounceMs,
      shouldSkipFirst = false,
      discardWhileFrozen = false,
      rootCallback,
    } = options;

    this.discardWhileFrozen = discardWhileFrozen;
    this.rootCallback = rootCallback;

    // Pre-bind methods that are called frequently to avoid creating new function objects
    this.observe = this.observe.bind(this);
    this.unobserve = this.unobserve.bind(this);
    this.addCallback = this.addCallback.bind(this);
    this.removeCallback = this.removeCallback.bind(this);

    const processEntries = (entries: IntersectionObserverEntry[]): void => {
      if (this.freezeCount > 0) {
        this.onUnfreeze = () => processEntries(entries);
        return;
      }

      const entriesLength = entries.length;
      for (let i = 0; i < entriesLength; i++) {
        const entry = entries[i];
        const callbackSet = this.callbacks.get(entry.target);

        if (callbackSet && callbackSet.size > 0) {
          const callbacks = Array.from(callbackSet);
          const callbackCount = callbacks.length;

          for (let j = 0; j < callbackCount; j++) {
            callbacks[j](entry);
          }
        }
      }

      if (this.rootCallback) {
        this.rootCallback(entries);
      }

      this.entriesAccumulator.clear();
    };

    // Create optimized throttled/debounced callback
    if (typeof throttleScheduler === "function") {
      this.observerCallback = throttleWith(throttleScheduler, () => {
        const entries = Array.from(this.entriesAccumulator.values());
        processEntries(entries);
      });
    } else if (throttleMs) {
      this.observerCallback = throttle(
        () => {
          const entries = Array.from(this.entriesAccumulator.values());
          processEntries(entries);
        },
        throttleMs,
        !shouldSkipFirst
      );
    } else if (debounceMs) {
      this.observerCallback = debounce(
        () => {
          const entries = Array.from(this.entriesAccumulator.values());
          processEntries(entries);
        },
        debounceMs,
        !shouldSkipFirst
      );
    } else {
      // No throttling/debouncing - use direct callback
      this.observerCallback = () => {
        const entries = Array.from(this.entriesAccumulator.values());
        processEntries(entries);
      };
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entriesLength = entries.length;
        // Use regular loop for better performance than for...of
        for (let i = 0; i < entriesLength; i++) {
          const entry = entries[i];
          this.entriesAccumulator.set(entry.target, entry);
        }
        this.observerCallback();
      },
      {
        root,
        rootMargin: margin ? `${margin}px` : undefined,
        threshold,
      }
    );
  }

  /**
   * Starts observing an element and registers a callback for its intersection changes.
   * @param element The DOM element to observe.
   * @param callback The callback to execute when the element's intersection changes.
   */
  observe(element: Element, callback: TargetCallback): void {
    if (!(element instanceof Element)) {
      throw new Error("Invalid element provided to observe.");
    }

    let callbackSet = this.callbacks.get(element);

    if (!callbackSet) {
      callbackSet = new Set<TargetCallback>();
      this.callbacks.set(element, callbackSet);
      this.observer.observe(element);
    }

    callbackSet.add(callback);
  }

  /**
   * Stops observing an element and removes all its callbacks.
   * @param element The DOM element to unobserve.
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.callbacks.delete(element);
    this.entriesAccumulator.delete(element);
  }

  /**
   * Adds a callback for an already-observed element.
   * @param element The DOM element to add a callback for.
   * @param callback The callback to execute when the element's intersection changes.
   */
  addCallback(element: Element, callback: TargetCallback): void {
    if (!(element instanceof Element)) {
      throw new Error("Invalid element provided to addCallback.");
    }

    let callbackSet = this.callbacks.get(element);

    if (!callbackSet) {
      callbackSet = new Set<TargetCallback>();
      this.callbacks.set(element, callbackSet);
    }

    callbackSet.add(callback);
  }

  /**
   * Removes a callback from an element's callback list.
   * Unobserves the element if no callbacks remain.
   * @param element The DOM element whose callback should be removed.
   * @param callback The callback to remove.
   */
  removeCallback(element: Element, callback: TargetCallback): void {
    const callbackSet = this.callbacks.get(element);

    if (!callbackSet) return;

    callbackSet.delete(callback);

    if (callbackSet.size === 0) {
      this.unobserve(element);
    }
  }

  /**
   * Manually processes all accumulated entries.
   */
  flushEntries(): void {
    if (this.entriesAccumulator.size > 0) {
      this.observerCallback();
    }
  }

  /**
   * Disconnects the observer and clears all resources.
   */
  destroy(): void {
    this.observer.disconnect();
    this.entriesAccumulator.clear();
    // WeakMap will handle its own cleanup
  }

  /**
   * Freezes callback processing. Optionally discards accumulated entries.
   */
  freeze(): void {
    this.freezeCount++;

    if (this.discardWhileFrozen && this.freezeCount === 1) {
      this.entriesAccumulator.clear();
    }
  }

  /**
   * Unfreezes callback processing and executes any pending callbacks if fully unfrozen.
   */
  unfreeze(): void {
    if (this.freezeCount <= 0) return;

    this.freezeCount--;

    if (this.freezeCount === 0 && this.onUnfreeze) {
      const unfreeze = this.onUnfreeze;
      this.onUnfreeze = undefined; // Clear before executing to prevent potential recursive issues
      unfreeze();
    }
  }
}
