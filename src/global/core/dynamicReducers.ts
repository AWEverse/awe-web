import { useState, useCallback, useEffect, useMemo } from "react";
import { Reducer } from "@reduxjs/toolkit";
import { store } from "./GlobalStore";
import type { RootState } from "./GlobalStore";

/**
 * Enhanced utilities for dynamic reducer management
 */

/**
 * Enhanced types for dynamic reducers
 */
export interface DynamicReducerInfo {
  readonly key: string;
  readonly reducer: Reducer;
  readonly isLoaded: boolean;
  readonly loadedAt: number;
  readonly version?: string;
  readonly dependencies?: readonly string[];
}

export interface DynamicReducerStats {
  readonly total: number;
  readonly loadedAt: ReadonlyArray<{ key: string; loadedAt: number }>;
  readonly oldestLoadTime: number | null;
  readonly newestLoadTime: number | null;
  readonly averageLoadTime: number | null;
}

/**
 * Enhanced manager for dynamic reducers with better performance and type safety
 */
class DynamicReducerManager {
  private readonly loadedReducers = new Map<string, DynamicReducerInfo>();
  private readonly loadingPromises = new Map<string, Promise<void>>();
  private readonly subscribers = new Set<(info: DynamicReducerInfo) => void>();

  /**
   * Subscribe to reducer loading events
   */
  subscribe(callback: (info: DynamicReducerInfo) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(info: DynamicReducerInfo): void {
    this.subscribers.forEach(callback => {
      try {
        callback(info);
      } catch (error) {
        console.error('Error in reducer manager subscriber:', error);
      }
    });
  }

  /**
   * Adds reducer synchronously with enhanced validation
   */
  addReducer(
    key: string,
    reducer: Reducer,
    metadata?: { version?: string; dependencies?: readonly string[] }
  ): boolean {
    if (this.hasReducer(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Reducer "${key}" is already loaded`);
      }
      return false;
    }

    const reducerManager = (store as any).reducerManager;
    if (!reducerManager) {
      console.error("ReducerManager not found on store");
      return false;
    }

    try {
      reducerManager.add(key, reducer);

      const info: DynamicReducerInfo = {
        key,
        reducer,
        isLoaded: true,
        loadedAt: Date.now(),
        version: metadata?.version,
        dependencies: metadata?.dependencies,
      };

      this.loadedReducers.set(key, info);
      this.notifySubscribers(info);

      if (process.env.NODE_ENV === 'development') {
        console.log(`Dynamic reducer "${key}" loaded successfully`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to add reducer "${key}":`, error);
      return false;
    }
  }

  /**
   * Adds reducer asynchronously with lazy loading and retry logic
   */
  async addReducerAsync(
    key: string,
    reducerFactory: () => Promise<{ default: Reducer }> | Promise<Reducer>,
    metadata?: { version?: string; dependencies?: readonly string[]; retries?: number }
  ): Promise<boolean> {
    if (this.hasReducer(key)) {
      return true;
    }

    // Prevent duplicate loading
    if (this.loadingPromises.has(key)) {
      await this.loadingPromises.get(key);
      return this.hasReducer(key);
    }

    const loadingPromise = this.loadReducerInternal(key, reducerFactory, metadata);
    this.loadingPromises.set(key, loadingPromise);

    try {
      await loadingPromise;
      return true;
    } catch (error) {
      console.error(`Failed to load reducer "${key}":`, error);
      return false;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  private async loadReducerInternal(
    key: string,
    reducerFactory: () => Promise<{ default: Reducer }> | Promise<Reducer>,
    metadata?: { version?: string; dependencies?: readonly string[]; retries?: number }
  ): Promise<void> {
    const maxRetries = metadata?.retries ?? 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const module = await reducerFactory();
        const reducer = 'default' in module ? module.default : module;

        if (typeof reducer !== 'function') {
          throw new Error(`Invalid reducer loaded for key "${key}"`);
        }

        this.addReducer(key, reducer, metadata);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`Failed to load reducer "${key}" after ${maxRetries} attempts`);
  }

  /**
   * Remove reducer with dependency checking
   */
  removeReducer(key: string, force = false): boolean {
    if (!this.hasReducer(key)) {
      return false;
    }

    // Check for dependents unless force removal
    if (!force) {
      const dependents = this.getDependents(key);
      if (dependents.length > 0) {
        console.warn(`Cannot remove reducer "${key}" - it has dependents:`, dependents);
        return false;
      }
    }

    const reducerManager = (store as any).reducerManager;
    if (!reducerManager) {
      console.error("ReducerManager not found on store");
      return false;
    }

    try {
      reducerManager.remove(key);
      this.loadedReducers.delete(key);

      if (process.env.NODE_ENV === 'development') {
        console.log(`Dynamic reducer "${key}" removed`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to remove reducer "${key}":`, error);
      return false;
    }
  }

  /**
   * Get reducers that depend on the given key
   */
  getDependents(key: string): string[] {
    const dependents: string[] = [];

    this.loadedReducers.forEach((info, reducerKey) => {
      if (info.dependencies?.includes(key)) {
        dependents.push(reducerKey);
      }
    });

    return dependents;
  }

  /**
   * Check if reducer exists
   */
  hasReducer(key: string): boolean {
    return this.loadedReducers.has(key);
  }

  /**
   * Get reducer information
   */
  getReducerInfo(key: string): DynamicReducerInfo | undefined {
    return this.loadedReducers.get(key);
  }

  /**
   * Get all loaded reducers
   */
  getLoadedReducers(): DynamicReducerInfo[] {
    return Array.from(this.loadedReducers.values());
  }

  /**
   * Get keys of all loaded reducers
   */
  getLoadedKeys(): string[] {
    return Array.from(this.loadedReducers.keys());
  }

  /**
   * Clear all dynamic reducers
   */
  clearAll(force = false): void {
    const keys = this.getLoadedKeys();
    keys.forEach(key => this.removeReducer(key, force));
  }

  /**
   * Get enhanced statistics
   */
  getStats(): DynamicReducerStats {
    const reducers = this.getLoadedReducers();
    const loadTimes = reducers.map(r => r.loadedAt);

    return {
      total: reducers.length,
      loadedAt: reducers.map(r => ({ key: r.key, loadedAt: r.loadedAt })),
      oldestLoadTime: loadTimes.length > 0 ? Math.min(...loadTimes) : null,
      newestLoadTime: loadTimes.length > 0 ? Math.max(...loadTimes) : null,
      averageLoadTime: loadTimes.length > 0 ?
        loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : null,
    };
  }

  /**
   * Validate reducer dependencies
   */
  validateDependencies(): { valid: boolean; missing: string[]; circular: string[] } {
    const missing: string[] = [];
    const circular: string[] = [];

    // Check for missing dependencies
    this.loadedReducers.forEach((info, key) => {
      info.dependencies?.forEach(dep => {
        if (!this.hasReducer(dep)) {
          missing.push(`${key} -> ${dep}`);
        }
      });
    });

    // Check for circular dependencies (simple implementation)
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (key: string): boolean => {
      if (visiting.has(key)) {
        circular.push(key);
        return true;
      }
      if (visited.has(key)) return false;

      visiting.add(key);
      const info = this.loadedReducers.get(key);

      if (info?.dependencies) {
        for (const dep of info.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      visiting.delete(key);
      visited.add(key);
      return false;
    };

    this.loadedReducers.forEach((_, key) => {
      if (!visited.has(key)) {
        hasCycle(key);
      }
    });

    return {
      valid: missing.length === 0 && circular.length === 0,
      missing,
      circular,
    };
  }
}

// Export singleton instance
export const dynamicReducerManager = new DynamicReducerManager();

/**
 * Enhanced hook for working with dynamic reducers in components
 */
export function useDynamicReducer(
  key: string,
  reducerFactory?: () => Promise<{ default: Reducer }> | Promise<Reducer>,
  options?: {
    version?: string;
    dependencies?: readonly string[];
    retries?: number;
    autoLoad?: boolean;
  }
) {
  const { version, dependencies, retries, autoLoad = true } = options ?? {};

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => dynamicReducerManager.hasReducer(key));
  const [error, setError] = useState<Error | null>(null);

  const loadReducer = useCallback(async () => {
    if (!reducerFactory || isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await dynamicReducerManager.addReducerAsync(
        key,
        reducerFactory,
        { version, dependencies, retries }
      );
      setIsLoaded(success);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`useDynamicReducer failed for "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, reducerFactory, isLoaded, version, dependencies, retries]);

  const unloadReducer = useCallback((force = false) => {
    const success = dynamicReducerManager.removeReducer(key, force);
    if (success) {
      setIsLoaded(false);
      setError(null);
    }
    return success;
  }, [key]);

  // Subscribe to reducer manager events
  useEffect(() => {
    const unsubscribe = dynamicReducerManager.subscribe((info) => {
      if (info.key === key && info.isLoaded) {
        setIsLoaded(true);
        setError(null);
      }
    });

    return unsubscribe;
  }, [key]);

  useEffect(() => {
    if (reducerFactory && !isLoaded && !isLoading && autoLoad) {
      loadReducer();
    }
  }, [reducerFactory, isLoaded, isLoading, loadReducer, autoLoad]);

  const reducerInfo = useMemo(() =>
    dynamicReducerManager.getReducerInfo(key),
    [key, isLoaded]
  );

  return {
    isLoading,
    isLoaded,
    error,
    reducerInfo,
    loadReducer,
    unloadReducer,
  };
}

/**
 * Hook for monitoring all dynamic reducers
 */
export function useDynamicReducerStats() {
  const [stats, setStats] = useState(() => dynamicReducerManager.getStats());

  useEffect(() => {
    const updateStats = () => setStats(dynamicReducerManager.getStats());

    const unsubscribe = dynamicReducerManager.subscribe(updateStats);

    // Also update on interval for real-time stats
    const interval = setInterval(updateStats, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return stats;
}

// Helper types
export type DynamicReducerFactory = () => Promise<{ default: Reducer }> | Promise<Reducer>;
export type ReducerLoadResult = {
  success: boolean;
  error?: Error;
};

// Re-export for convenience
export type { RootState };
