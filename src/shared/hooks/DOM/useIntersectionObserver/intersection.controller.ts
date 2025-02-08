import { throttleWith, throttle, debounce, Scheduler } from "@/lib/core";
import { CallbackManager, createCallbackManager } from "@/lib/utils/callbacks";

export type TargetCallback = (entry: IntersectionObserverEntry) => void;
export type RootCallback = (entries: IntersectionObserverEntry[]) => void;
export type NoneToVoidFunction = () => void;

interface IIntersectionController {
  observer: IntersectionObserver;
  addCallback: (element: Element, callback: TargetCallback) => void;
  removeCallback: (element: Element, callback: TargetCallback) => void;
  destroy: NoneToVoidFunction;
}

/**
 * A class that encapsulates the IntersectionObserver logic, including:
 * - Observing multiple elements and running per-element callbacks.
 * - Throttling or debouncing the callback (if needed).
 * - Support for freezing/unfreezing observer updates.
 */
export class IntersectionController implements IIntersectionController {
  public observer: IntersectionObserver;

  private callbacks: Map<Element, CallbackManager<TargetCallback>> = new Map();
  private entriesAccumulator: Map<Element, IntersectionObserverEntry> =
    new Map();

  private freezeCount = 0;

  private onUnfreeze: NoneToVoidFunction | undefined;
  private observerCallback: () => void;

  constructor(options: {
    root: Element | null;
    margin?: number;
    threshold?: number | number[];
    throttleMs?: number;
    throttleScheduler?: Scheduler;
    debounceMs?: number;
    shouldSkipFirst?: boolean;
    rootCallback?: RootCallback;
  }) {
    const {
      root,
      margin,
      threshold,
      throttleMs,
      throttleScheduler,
      debounceMs,
      shouldSkipFirst,
      rootCallback,
    } = options;

    // Define the core synchronous callback which processes the accumulated entries.
    const observerCallbackSync = () => {
      // If frozen, schedule execution for later.
      if (this.freezeCount > 0) {
        this.onUnfreeze = this.observerCallback;
        return;
      }

      // Get all the unique entries.
      const entries = Array.from(this.entriesAccumulator.values());

      // Run callbacks for each target element.
      entries.forEach((entry) => {
        const callbackManager = this.callbacks.get(entry.target as Element);
        callbackManager?.runCallbacks(entry);
      });

      // Call the optional root callback with all entries.
      if (rootCallback) {
        rootCallback(entries);
      }

      // Clear the accumulator.
      this.entriesAccumulator.clear();
    };

    // Wrap the synchronous callback in throttling/debouncing if desired.
    if (typeof throttleScheduler === "function") {
      this.observerCallback = throttleWith(
        throttleScheduler,
        observerCallbackSync,
      );
    } else if (throttleMs) {
      this.observerCallback = throttle(
        observerCallbackSync,
        throttleMs,
        !shouldSkipFirst,
      );
    } else if (debounceMs) {
      this.observerCallback = debounce(
        observerCallbackSync,
        debounceMs,
        !shouldSkipFirst,
      );
    } else {
      this.observerCallback = observerCallbackSync;
    }

    // Create the IntersectionObserver with a callback that accumulates entries.
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.entriesAccumulator.set(entry.target, entry);
        });
        // If frozen, do not process immediately.
        if (this.freezeCount > 0) {
          this.onUnfreeze = this.observerCallback;
        } else {
          this.observerCallback();
        }
      },
      {
        root,
        rootMargin: margin ? `${margin}px` : undefined,
        threshold,
      },
    );
  }

  /**
   * Registers a callback for a specific element.
   * The callback will be executed whenever that element's intersection changes.
   *
   * @param element The DOM element to observe.
   * @param callback The function to call with the intersection entry.
   */
  addCallback(element: Element, callback: TargetCallback): void {
    if (!this.callbacks.has(element)) {
      this.callbacks.set(element, createCallbackManager<TargetCallback>());
    }
    const callbackManager = this.callbacks.get(element)!;
    callbackManager.addCallback(callback);
  }

  /**
   * Removes a previously registered callback for the specified element.
   *
   * @param element The DOM element whose callback should be removed.
   * @param callback The callback to remove.
   */
  removeCallback(element: Element, callback: TargetCallback): void {
    const callbackManager = this.callbacks.get(element);
    if (!callbackManager) return;
    callbackManager.removeCallback(callback);
    if (!callbackManager.hasCallbacks()) {
      this.callbacks.delete(element);
    }
  }

  /**
   * Disconnects the observer and clears all callbacks.
   */
  destroy(): void {
    this.callbacks.clear();
    this.observer.disconnect();
  }

  /**
   * Freezes the processing of observer callbacks.
   * This is useful when you need to temporarily suspend updates (e.g. during heavy animations).
   */
  freeze(): void {
    this.freezeCount++;
  }

  /**
   * Unfreezes the processing of observer callbacks.
   * If the observer was scheduled to run while frozen, it will be executed.
   */
  unfreeze(): void {
    if (this.freezeCount <= 0) {
      return;
    }
    this.freezeCount--;
    if (this.freezeCount === 0 && this.onUnfreeze) {
      this.onUnfreeze();
      this.onUnfreeze = undefined;
    }
  }
}
