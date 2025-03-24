import { useState, useEffect, useRef } from 'react';
import SignalError from './SignalError';
import { defaultEquals } from './SignalsCompaire';
import SignalDebugManager from './SignalDebugManager';
import { SignalOptions, Listener, Compute, Cleanup, SignalCleanup } from './SignalsTypes';
import SignalsConfig from './SignalsConfig';
import { fastRaf } from '../schedulers';


/**
 * Generate a unique identifier for each signal with improved collision prevention
 */
let signalIdCounter = 0;
function generateSignalId(name?: string): string {
  return `${name || signalIdCounter + '_signal'}_${Date.now().toString(36)}_${(signalIdCounter++).toString(36)}`;
}

/**
 * Enhanced signal creation with improved memory management, performance, and error handling
 */
export function createSignal<T>(initialValue: T, options?: SignalOptions<T>) {
  const listeners = new Set<Listener<T>>();
  const id = generateSignalId(options?.name);

  // Select the appropriate equals function
  const equals = options?.equals || defaultEquals;

  // Determine if the signal is lazy
  const isLazy = options?.lazy !== false; // Lazy by default

  // Use WeakRef to track dependent computations for automatic cleanup
  // This allows garbage collection of dependent values when they're no longer needed
  const dependents = new Set<WeakRef<any>>();

  // We'll periodically clean up stale WeakRefs to prevent memory growth
  let lastCleanupTime = Date.now();

  // Value storage
  let currentValue = initialValue;
  let isValueInitialized = true;

  // For lazy signals, track if value needs computation
  let isDirty = false;
  let valueFactory: (() => T) | null = null;

  // Debug info
  SignalDebugManager.registerSignal(id, { id, type: 'basic', value: currentValue });

  // Clean up stale WeakRefs periodically
  const cleanupStaleReferences = () => {
    const now = Date.now();
    // Only clean up every 30 seconds to reduce overhead
    if (now - lastCleanupTime > 30000) {
      let removedCount = 0;

      dependents.forEach(depRef => {
        if (!depRef.deref()) {
          dependents.delete(depRef);
          removedCount++;
        }
      });

      if (SignalsConfig.debugMode && removedCount > 0) {
        console.debug(`[Signals] Cleaned up ${removedCount} stale dependents for ${id}`);
      }

      lastCleanupTime = now;
    }
  };

  // Read function with lazy evaluation support and error handling
  const get = (): T => {
    try {
      // Support for automatic dependency tracking
      if (activeContext) {
        activeContext.dependencies.add({
          subscribe,
          id
        });
      }

      // Handle lazy evaluation
      if (isLazy && isDirty && valueFactory) {
        try {
          currentValue = valueFactory();
        } catch (err) {
          console.error(`[Signals] Error computing value for ${id}:`, err);
          // We still need to mark it as initialized and not dirty to prevent infinite loops
          isDirty = false;
          isValueInitialized = true;
          throw new SignalError(`Failed to compute value: ${err instanceof Error ? err.message : String(err)}`, id);
        }
        isDirty = false;
        isValueInitialized = true;
      }

      // Periodically clean up to prevent memory leaks
      cleanupStaleReferences();

      return currentValue;
    } catch (err) {
      // Wrap any other errors
      if (!(err instanceof SignalError)) {
        throw new SignalError(`Error in get(): ${err instanceof Error ? err.message : String(err)}`, id);
      }
      throw err;
    }
  };

  // Lazy initialization function with error handling
  const initialize = (factory: () => T) => {
    try {
      valueFactory = factory;
      isDirty = true;
      isValueInitialized = false;
      return { get, set, subscribe };
    } catch (err) {
      throw new SignalError(`Error in initialize(): ${err instanceof Error ? err.message : String(err)}`, id);
    }
  };

  // Write function with batching support and improved error handling
  const set = (nextValue: T | Compute<T>): T => {
    try {
      let newValue: T;

      // Calculate the new value based on the input type
      if (typeof nextValue === 'function') {
        try {
          newValue = (nextValue as Compute<T>)(isValueInitialized ? currentValue : initialValue);
        } catch (err) {
          throw new SignalError(`Error in compute function: ${err instanceof Error ? err.message : String(err)}`, id);
        }
      } else {
        newValue = nextValue;
      }

      // Skip update if value hasn't changed (performance optimization)
      const hasChanged = !equals(currentValue, newValue);

      if (hasChanged) {
        const oldValue = currentValue;
        currentValue = newValue;
        isValueInitialized = true;

        // Use batching for listener notifications (efficiency improvement)
        if (batchDepth > 0) {
          pendingUpdates.set(id, () => {
            notifyListeners(oldValue);
          });
        } else {
          notifyListeners(oldValue);
        }
      }

      return currentValue;
    } catch (err) {
      // Wrap any other errors
      if (!(err instanceof SignalError)) {
        throw new SignalError(`Error in set(): ${err instanceof Error ? err.message : String(err)}`, id);
      }
      throw err;
    }
  };

  // Notify listeners with error handling and performance optimizations
  const notifyListeners = (oldValue: T) => {
    try {
      // Store a snapshot of current listeners to avoid issues if listeners change during notification
      const currentListeners = Array.from(listeners);
      const listenerCount = currentListeners.length;

      // No need to proceed if there are no listeners
      if (listenerCount === 0) return;

      // Handle throttling of updates for better performance
      if (SignalsConfig.batchUpdateThrottleMs > 0 && listenerCount > 1) {
        fastRaf(() => {
          for (let i = 0; i < currentListeners.length; i++) {
            try {
              currentListeners[i](currentValue);
            } catch (err) {
              console.error(`[Signals] Error in listener for ${id}:`, err);
              // Continue notifying other listeners even if one fails
            }
          }
        });
      } else {
        // Immediately notify for small listener counts (better responsiveness)
        for (let i = 0; i < currentListeners.length; i++) {
          try {
            currentListeners[i](currentValue);
          } catch (err) {
            console.error(`[Signals] Error in listener for ${id}:`, err);
            // Continue notifying other listeners even if one fails
          }
        }
      }

      // Notify dependent computations
      dependents.forEach(depRef => {
        const dep = depRef.deref();
        if (dep) {
          try {
            dep.markDirty();
          } catch (err) {
            console.error(`[Signals] Error marking dependent as dirty for ${id}:`, err);
          }
        } else {
          // Clean up if the dependent has been garbage collected
          dependents.delete(depRef);
        }
      });

      // Debug logging
      if (options?.debugEnabled || SignalsConfig.debugMode) {
        console.debug(`[Signals] ${id} updated:`, { oldValue, newValue: currentValue });
      }
    } catch (err) {
      throw new SignalError(`Error in notifyListeners(): ${err instanceof Error ? err.message : String(err)}`, id);
    }
  };

  // Subscription with memory leak protection and improved error handling
  const subscribe = (listener: Listener<T>): Cleanup => {
    try {
      if (typeof listener !== 'function') {
        throw new SignalError('Listener must be a function', id);
      }

      listeners.add(listener);
      SignalDebugManager.logSubscription(id);

      // Return cleanup function that properly removes the listener
      return () => {
        listeners.delete(listener);
        SignalDebugManager.logUnsubscription(id);

        // Auto-dispose signal if no more listeners and no dependents
        if (listeners.size === 0 && dependents.size === 0) {
          // Allow garbage collection
          SignalDebugManager.unregisterSignal(id);
        }
      };
    } catch (err) {
      if (!(err instanceof SignalError)) {
        throw new SignalError(`Error in subscribe(): ${err instanceof Error ? err.message : String(err)}`, id);
      }
      throw err;
    }
  };

  // Register dependency for automatic updates with type safety
  const addDependent = (computation: any) => {
    if (!computation || typeof computation.markDirty !== 'function') {
      SignalDebugManager.logWarning(id, 'Invalid dependent object provided to addDependent()');
      return;
    }
    dependents.add(new WeakRef(computation));
  };

  // Create a dispose method to clean up resources
  const dispose = () => {
    listeners.clear();
    dependents.clear();
    SignalDebugManager.unregisterSignal(id);
  };

  // Return a seal object with clearly defined APIs
  const signalObject = {
    get,
    set,
    subscribe,
    id,
    addDependent,
    initialize,
    dispose,
    // Convenient property access
    get value() { return get(); },
    set value(v: T) { set(v); }
  };

  // Add dispose to the returned object
  Object.defineProperty(signalObject, 'dispose', {
    value: dispose,
    enumerable: true,
    configurable: false,
    writable: false
  });

  return signalObject;
}

// Track active computation context for automatic dependency detection
let activeContext: { dependencies: Set<{ subscribe: Function, id: string }> } | null = null;

/**
 * Enhanced computed signal with automatic dependency tracking
 * and optimized update propagation
 */
export function computed<T>(compute: () => T, options?: SignalOptions<T>) {
  if (typeof compute !== 'function') {
    throw new Error('[Signals] Compute must be a function');
  }

  const id = generateSignalId(options?.name || 'computed');
  const equals = options?.equals || defaultEquals;
  const isLazy = options?.lazy !== undefined ? options?.lazy : true; // Lazy by default for computed values

  // Create a base signal for the computed value
  const signal = createSignal<T>(undefined as any, { ...options, name: id });

  // Tracking state
  const dependencies = new Set<SignalCleanup>();
  let isDirty = true;
  let isEvaluating = false;
  let cachedValue: T;
  let hasValue = false;
  let errorState: Error | null = null;
  let lastEvaluationTime = 0;

  // Clean up any previous dependencies before re-evaluation
  const cleanupDependencies = () => {
    dependencies.forEach(dep => {
      dep.unsubscribe();
    });
    dependencies.clear();
  };

  // Mark computed value as needing recalculation with debouncing support
  const markDirty = () => {
    // Don't trigger multiple evaluations during high-frequency updates
    const now = Date.now();
    const timeSinceLastEval = now - lastEvaluationTime;

    // Implement debouncing for high-frequency updates (performance optimization)
    // Don't re-evaluate more than once per frame if we're already dirty
    if (isDirty && timeSinceLastEval < 16) {
      return;
    }

    if (!isDirty) {
      isDirty = true;
      errorState = null;

      // Only notify listeners if we're not using lazy evaluation
      // or if the value is actively being observed
      if (!isLazy) {
        evaluate();
      }
    }
  };

  const MAX_EVALUATION_DEPTH = 100;
  let evaluationDepth = 0;
  let evaluationCount = 0;

  // Evaluate the computed expression and update the signal value with improved error handling
  const evaluate = (): T => {
    // Safety check to prevent stack overflow from circular dependencies
    if (isEvaluating) {
      // Return cached value or throw a circular dependency error
      if (hasValue) {
        SignalDebugManager.logWarning(id, 'Circular dependency detected - returning cached value');
        return cachedValue;
      }
      throw new SignalError('Circular dependency detected and no cached value available', id);
    }

    // Track evaluation depth to prevent infinite recursion
    evaluationDepth++;
    evaluationCount++;

    if (evaluationDepth > MAX_EVALUATION_DEPTH) {
      evaluationDepth--;
      const error = new SignalError('Maximum evaluation depth exceeded - likely circular dependency', id);
      errorState = error;
      throw error;
    }

    isEvaluating = true;
    lastEvaluationTime = Date.now();

    // Clean up previous dependencies to prevent memory leaks
    cleanupDependencies();

    // Set up dependency tracking context with proper cleanup
    const prevContext = activeContext;
    activeContext = { dependencies: new Set() };

    try {
      // Compute the new value with error handling
      const newValue = compute();

      // Only update if the value changed or this is the first computation
      if (!hasValue || !equals(cachedValue, newValue)) {
        cachedValue = newValue;
        hasValue = true;
        signal.set(newValue);
      }

      // Set up subscriptions to dependencies with proper error handling
      activeContext.dependencies.forEach(dep => {
        try {
          const unsubscribe = dep.subscribe(() => markDirty());
          dependencies.add({ unsubscribe, signal: dep });
        } catch (err) {
          console.error(`[Signals] Error subscribing to dependency ${dep.id} for ${id}:`, err);
        }
      });

      isDirty = false;
      errorState = null;
      return newValue;

    } catch (err) {
      // Properly handle and propagate errors
      const wrappedError = err instanceof SignalError
        ? err
        : new SignalError(`Error in compute function: ${err instanceof Error ? err.message : String(err)}`, id);

      errorState = wrappedError;

      // Re-throw but still ensure proper cleanup
      throw wrappedError;
    } finally {
      // Always restore previous tracking context and clean up
      activeContext = prevContext;
      isEvaluating = false;
      evaluationDepth--;

      // Performance monitoring
      if (SignalsConfig.debugMode && evaluationCount % 100 === 0) {
        console.debug(`[Signals] ${id} has been evaluated ${evaluationCount} times`);
      }
    }
  };

  // Enhanced get function with error handling and performance tracking
  const get = () => {
    try {
      if (errorState) {
        throw errorState;
      }

      if (isDirty) {
        evaluate();
      }

      return signal.get();
    } catch (err) {
      if (!(err instanceof SignalError)) {
        const wrapped = new SignalError(`Error in computed get(): ${err instanceof Error ? err.message : String(err)}`, id);
        errorState = wrapped;
        throw wrapped;
      }
      throw err;
    }
  };

  // Proper cleanup of all resources
  const dispose = () => {
    cleanupDependencies();
    SignalDebugManager.unregisterSignal(id);
    if (signal && typeof signal.dispose === 'function') {
      signal.dispose();
    }
  };

  // Create the computed signal object with proper typing
  const computedSignal = {
    get,
    subscribe: signal.subscribe,
    id,
    markDirty,
    dispose,
    get value() { return get(); }
  };

  // If not lazy, evaluate immediately
  if (!isLazy) {
    try {
      evaluate();
    } catch (err) {
      console.error(`[Signals] Error during initial evaluation of ${id}:`, err);
      // We still want to return the signal even if the initial evaluation fails
    }
  }

  // Register for debugging
  SignalDebugManager.registerSignal(id, {
    id,
    type: 'computed',
    dependencies: Array.from(dependencies).map(d => d.signal.id),
    isLazy,
    evaluationCount: () => evaluationCount
  });

  return computedSignal;
}

/**
 * Enhanced batch update mechanism with transaction support and error handling
 */
let batchDepth = 0;
const pendingUpdates = new Map<string, () => void>();
let batchErrorHandler: ((err: Error) => void) | null = null;

/**
 * Improved batch function with error handling and transaction support
 */
export function batch<T>(callback: () => T, errorHandler?: (err: Error) => void): T {
  if (typeof callback !== 'function') {
    throw new Error('[Signals] batch requires a function argument');
  }

  const previousErrorHandler = batchErrorHandler;
  if (errorHandler) batchErrorHandler = errorHandler;

  batchDepth++;
  try {
    return callback();
  } catch (err) {
    if (batchErrorHandler) {
      batchErrorHandler(err instanceof Error ? err : new Error(String(err)));
      return undefined as unknown as T;
    }
    throw err;
  } finally {
    batchDepth--;
    batchErrorHandler = previousErrorHandler;

    // Process all pending updates when exiting the outermost batch
    if (batchDepth === 0 && pendingUpdates.size > 0) {
      const updates = Array.from(pendingUpdates.values());
      pendingUpdates.clear();

      // Execute all updates with error handling
      updates.forEach(update => {
        try {
          update();
        } catch (err) {
          console.error('[Signals] Error in batched update:', err);
        }
      });
    }
  }
}

/**
 * Create a signal that automatically disposes when there are no more subscribers
 * This helps prevent memory leaks from forgotten signals
 */
export function autoDisposingSignal<T>(initialValue: T, options?: SignalOptions<T>) {
  const signal = createSignal(initialValue, options);
  let subscriptionCount = 0;

  // Override subscribe to track subscription count
  const originalSubscribe = signal.subscribe;
  signal.subscribe = (listener: Listener<T>): Cleanup => {
    subscriptionCount++;

    const cleanup = originalSubscribe(listener);

    return () => {
      cleanup();
      subscriptionCount--;

      // Auto-dispose when no more subscribers
      if (subscriptionCount === 0) {
        if (typeof signal.dispose === 'function') {
          signal.dispose();
        }
      }
    };
  };

  return signal;
}

// Fix for useSignal hook to prevent null reference error
export function useSignal<T>(initialValue: T, options?: SignalOptions<T>) {
  const signalRef = useRef<ReturnType<typeof createSignal<T>> | null>(null);

  // Create the signal only once (on mount)


  // Force re-render when the signal changes
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    if (!signalRef.current) {
      signalRef.current = createSignal(initialValue, options);
    }
    const signal = signalRef.current!;

    // Subscribe to changes and trigger re-render
    const cleanup = signal.subscribe(() => {
      setForceUpdate({});
    });

    // Clean up on unmount
    return () => {
      cleanup();

      // Only dispose if the signal ref still exists
      if (signalRef.current && typeof signalRef.current.dispose === 'function') {
        signalRef.current.dispose();
      }
      signalRef.current = null;
    };
  }, []);

  // Return a stable API
  const stableApi = useRef({
    get: () => signalRef.current?.get() ?? initialValue,
    set: (value: T | Compute<T>) => signalRef.current?.set(value),
    get value() { return signalRef.current?.get() ?? initialValue; },
    set value(v: T) { signalRef.current?.set(v); }
  }).current;

  return stableApi;
}

// Fix for useComputed hook to prevent null reference error
export function useComputed<T>(compute: () => T, options?: SignalOptions<T>) {
  const computedRef = useRef<ReturnType<typeof computed<T>> | null>(null);

  // Store the initial computed value to prevent null returns
  const [initialValue] = useState<T>(() => {
    try {
      return compute();
    } catch (err) {
      console.error(`[Signals] Error computing initial value:`, err);
      return undefined as unknown as T;
    }
  });


  // Force re-render when the computed value changes
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    if (!computedRef.current) {
      computedRef.current = computed(compute, options);
    }

    const comp = computedRef.current!;

    // Subscribe to changes and trigger re-render
    const cleanup = comp.subscribe(() => {
      setForceUpdate({});
    });

    // Clean up on unmount
    return () => {
      cleanup();

      // Only dispose if the computed ref still exists
      if (computedRef.current && typeof computedRef.current.dispose === 'function') {
        computedRef.current.dispose();
      }
      computedRef.current = null;
    };
  }, []);

  // Return a stable API with null safety
  const stableValue = useRef({
    get: () => computedRef.current?.get() ?? initialValue,
    get value() { return computedRef.current?.get() ?? initialValue; }
  }).current;

  return stableValue;
}
