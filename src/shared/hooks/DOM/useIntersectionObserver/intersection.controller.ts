import { throttleWith, throttle, debounce, Scheduler, IDisposable } from "@/lib/core";
import { CallbackManager, createCallbackManager } from "@/lib/utils/callbacks";

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
 * A class that encapsulates IntersectionObserver logic for:
 * - Observing multiple elements with per-element callbacks.
 * - Optional throttling or debouncing of callbacks.
 * - Freezing/unfreezing observer updates with configurable entry discarding.
 * - Efficient resource management and browser-native performance.
 */
export class IntersectionController implements IIntersectionController, IDisposable {
  public observer: IntersectionObserver;

  private callbacks: WeakMap<Element, CallbackManager<TargetCallback>> = new WeakMap();
  private entriesAccumulator: Map<Element, IntersectionObserverEntry> = new Map();
  private freezeCount = 0;
  private onUnfreeze: NoneToVoidFunction | undefined;
  private observerCallback: NoneToVoidFunction;
  private discardWhileFrozen: boolean;

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

    const observerCallbackSync = (entries: IntersectionObserverEntry[]) => {
      if (this.freezeCount > 0) {
        this.onUnfreeze = () => observerCallbackSync(entries);
        return;
      }

      // Process each entry directly from the observer's batch
      for (const entry of entries) {
        const callbackManager = this.callbacks.get(entry.target);
        if (callbackManager) {
          callbackManager.runCallbacks(entry);
        }
      }

      if (rootCallback) {
        rootCallback(entries);
      }

      this.entriesAccumulator.clear();
    };

    // Wrap callback with throttle/debounce if specified
    if (typeof throttleScheduler === "function") {
      this.observerCallback = throttleWith(throttleScheduler, () =>
        observerCallbackSync([...this.entriesAccumulator.values()])
      );
    } else if (throttleMs) {
      this.observerCallback = throttle(
        () => observerCallbackSync([...this.entriesAccumulator.values()]),
        throttleMs,
        !shouldSkipFirst
      );
    } else if (debounceMs) {
      this.observerCallback = debounce(
        () => observerCallbackSync([...this.entriesAccumulator.values()]),
        debounceMs,
        !shouldSkipFirst
      );
    } else {
      this.observerCallback = () =>
        observerCallbackSync([...this.entriesAccumulator.values()]);
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
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
    if (!this.callbacks.has(element)) {
      this.callbacks.set(element, createCallbackManager<TargetCallback>());
      this.observer.observe(element);
    }
    this.addCallback(element, callback);
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
    if (!this.callbacks.has(element)) {
      this.callbacks.set(element, createCallbackManager<TargetCallback>());
    }
    const callbackManager = this.callbacks.get(element)!;
    callbackManager.addCallback(callback);
  }

  /**
   * Removes a callback from an element's callback list.
   * Unobserves the element if no callbacks remain.
   * @param element The DOM element whose callback should be removed.
   * @param callback The callback to remove.
   */
  removeCallback(element: Element, callback: TargetCallback): void {
    const callbackManager = this.callbacks.get(element);
    if (!callbackManager) return;
    callbackManager.removeCallback(callback);
    if (!callbackManager.hasCallbacks()) {
      this.unobserve(element);
    }
  }

  /**
   * Manually processes all accumulated entries.
   */
  flushEntries(): void {
    this.observerCallback();
  }

  /**
   * Disconnects the observer and clears all resources.
   */
  destroy(): void {
    this.entriesAccumulator.clear();
    this.callbacks = new WeakMap(); // Reset for clarity, though not strictly needed
    this.observer.disconnect();
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
      this.onUnfreeze();
      this.onUnfreeze = undefined;
    }
  }
}
