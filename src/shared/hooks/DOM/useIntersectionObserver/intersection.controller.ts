import { throttleWith, throttle, debounce, Scheduler, IDisposable } from "@/lib/core";
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
export class IntersectionController implements IIntersectionController, IDisposable {
  public observer: IntersectionObserver;

  // Use WeakMap so that DOM elements (keys) can be garbage-collected when removed.
  private callbacks: WeakMap<Element, CallbackManager<TargetCallback>> = new WeakMap();
  // Retain a Map for entries since we need to iterate its values.
  private entriesAccumulator: Map<Element, IntersectionObserverEntry> = new Map();

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

    const observerCallbackSync = () => {
      if (this.freezeCount > 0) {
        this.onUnfreeze = this.observerCallback;
        return;
      }

      // Instead of creating an intermediate array with Array.from,
      // we can iterate directly over the map and collect entries.
      const entries: IntersectionObserverEntry[] = [];
      this.entriesAccumulator.forEach((entry) => {
        entries.push(entry);
        const callbackManager = this.callbacks.get(entry.target);
        if (callbackManager) {
          callbackManager.runCallbacks(entry);
        }
      });

      if (rootCallback) {
        rootCallback(entries);
      }

      this.entriesAccumulator.clear();
    };

    if (typeof throttleScheduler === "function") {
      this.observerCallback = throttleWith(throttleScheduler, observerCallbackSync);
    } else if (throttleMs) {
      this.observerCallback = throttle(observerCallbackSync, throttleMs, !shouldSkipFirst);
    } else if (debounceMs) {
      this.observerCallback = debounce(observerCallbackSync, debounceMs, !shouldSkipFirst);
    } else {
      this.observerCallback = observerCallbackSync;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.entriesAccumulator.set(entry.target, entry);
        }

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
      }
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
    // The WeakMap automatically cleans up when the element is unreachable,
    // so an explicit deletion isn’t strictly necessary.
  }

  /**
   * Disconnects the observer and clears all callbacks.
   */
  destroy(): void {
    this.entriesAccumulator.clear();
    this.observer.disconnect();
  }

  /**
   * Freezes the processing of observer callbacks.
   * Useful for temporarily suspending updates (e.g. during heavy animations).
   */
  freeze(): void {
    this.freezeCount++;
  }

  /**
   * Unfreezes the processing of observer callbacks.
   * If a callback was scheduled while frozen, it will be executed now.
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
