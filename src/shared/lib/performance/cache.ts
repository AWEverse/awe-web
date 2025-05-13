/**
 * Performance utilities for caching and memoization
 */

const cacheStore = new Map<string, { value: any; timestamp: number }>();

interface CacheOptions {
  ttl?: number;  // Time to live in milliseconds
  maxSize?: number;  // Maximum number of entries
}

/**
 * LRU cache implementation
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Refresh key position
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  { ttl = 300000, maxSize = 100 }: CacheOptions = {}
): T {
  const cache = new LRUCache<string, { value: ReturnType<T>; timestamp: number }>(maxSize);

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
}

/**
 * Cache async function results
 */
export async function cacheAsync<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = cacheStore.get(key);
  if (cached && (!options.ttl || Date.now() - cached.timestamp < options.ttl)) {
    return cached.value;
  }

  const value = await fn();
  cacheStore.set(key, { value, timestamp: Date.now() });

  // Cleanup if maxSize is set
  if (options.maxSize && cacheStore.size > options.maxSize) {
    const entries = Array.from(cacheStore.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    while (cacheStore.size > options.maxSize) {
      cacheStore.delete(entries.shift()![0]);
    }
  }

  return value;
}

/**
 * Clear all caches
 */
export function clearCaches(): void {
  cacheStore.clear();
}
