import { throttle, debounce, Scheduler, throttleWith } from "@/lib/core";

export type TargetCallback = (entry: IntersectionObserverEntry) => void;
export type RootCallback = (entries: IntersectionObserverEntry[]) => void;
export type NoneToVoidFunction = () => void;

export class IntersectionController {
  public observer: IntersectionObserver;
  private callbacks = new WeakMap<Element, Set<TargetCallback>>();
  private entries = new Map<Element, IntersectionObserverEntry>();
  private isFrozen = false;
  private pendingCallback?: NoneToVoidFunction;
  private readonly rootCallback?: RootCallback;

  constructor(options: {
    root?: Element | null;
    margin?: number;
    threshold?: number | number[];
    throttleMs?: number;
    throttleScheduler?: Scheduler;
    debounceMs?: number;
    rootCallback?: RootCallback;
  }) {
    const {
      root,
      margin,
      threshold,
      throttleMs,
      throttleScheduler,
      debounceMs,
      rootCallback,
    } = options;

    this.rootCallback = rootCallback;

    // Process entries efficiently
    const processEntries = (entries: IntersectionObserverEntry[]) => {
      if (this.isFrozen) {
        this.pendingCallback = () => processEntries(entries);
        return;
      }

      for (const entry of entries) {
        const callbackSet = this.callbacks.get(entry.target);
        if (callbackSet) {
          callbackSet.forEach((cb) => cb(entry));
        }
      }

      if (this.rootCallback) {
        this.rootCallback(entries);
      }

      this.entries.clear();
    };

    // Create observer callback with optional throttling/debouncing
    let observerCallback: NoneToVoidFunction;
    const flushEntries = () => processEntries([...this.entries.values()]);

    if (throttleScheduler) {
      observerCallback = throttleWith(throttleScheduler, flushEntries);
    } else if (throttleMs) {
      observerCallback = throttle(flushEntries, throttleMs);
    } else if (debounceMs) {
      observerCallback = debounce(flushEntries, debounceMs);
    } else {
      observerCallback = flushEntries;
    }

    // Initialize IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => this.entries.set(entry.target, entry));
        observerCallback();
      },
      {
        root,
        rootMargin: margin ? `${margin}px` : undefined,
        threshold,
      }
    );
  }

  observe(element: Element, callback: TargetCallback): void {
    let callbackSet = this.callbacks.get(element);
    if (!callbackSet) {
      callbackSet = new Set();
      this.callbacks.set(element, callbackSet);
      this.observer.observe(element);
    }
    callbackSet.add(callback);
  }

  unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.callbacks.delete(element);
    this.entries.delete(element);
  }

  addCallback(element: Element, callback: TargetCallback): void {
    const callbackSet = this.callbacks.get(element) || new Set();
    callbackSet.add(callback);
    this.callbacks.set(element, callbackSet);
  }

  removeCallback(element: Element, callback: TargetCallback): void {
    const callbackSet = this.callbacks.get(element);
    if (callbackSet) {
      callbackSet.delete(callback);
      if (callbackSet.size === 0) {
        this.unobserve(element);
      }
    }
  }

  flushEntries(): void {
    if (this.entries.size > 0) {
      this.pendingCallback = () => this.flushEntries();
      this.pendingCallback();
      this.pendingCallback = undefined;
    }
  }

  destroy(): void {
    this.observer.disconnect();
    this.entries.clear();
  }

  freeze(): void {
    this.isFrozen = true;
  }

  unfreeze(): void {
    this.isFrozen = false;
    if (this.pendingCallback) {
      this.pendingCallback();
      this.pendingCallback = undefined;
    }
  }
}
