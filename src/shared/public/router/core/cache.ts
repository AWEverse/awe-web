import { ComponentType } from 'react';

interface CacheEntry {
  component: ComponentType<any>;
  loadTime?: number;
  lastAccessed?: number;
}

export class RouterCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, component: ComponentType<any>, loadTime?: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      component,
      loadTime,
      lastAccessed: Date.now()
    });
  }

  get(key: string): ComponentType<any> | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      return entry.component;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getMetrics(key: string): Omit<CacheEntry, 'component'> | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    const { component, ...metrics } = entry;
    return metrics;
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLeastRecentlyUsed(): void {
    let oldest: [string, CacheEntry] | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || (entry.lastAccessed || 0) < (oldest[1].lastAccessed || 0)) {
        oldest = [key, entry];
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  getSize(): number {
    return this.cache.size;
  }

  getMaxSize(): number {
    return this.maxSize;
  }
}

export const componentCache = new RouterCache();
