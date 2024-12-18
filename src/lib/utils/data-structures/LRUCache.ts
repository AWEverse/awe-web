interface LRUMapValue<T> {
  value: T;
  expiresAt: number;
}

class LRUCache<T> {
  private cache: Map<string, LRUMapValue<T>>;
  private maxEntries: number;
  private defaultExpiration: number;
  private onEviction?: (key: string, value: T) => void;

  constructor(maxEntries: number = 100, defaultExpiration: number = 60000, onEviction?: (key: string, value: T) => void) {
    this.cache = new Map<string, LRUMapValue<T>>();
    this.maxEntries = maxEntries;
    this.defaultExpiration = defaultExpiration;
    this.onEviction = onEviction;
  }

  public getValue(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (entry !== undefined) {
      const currentTime = Date.now();

      if (entry.expiresAt < currentTime) {
        this.cache.delete(key);
        this.onEviction?.(key, entry.value);
        return undefined;
      }

      this.cache.delete(key);
      this.cache.set(key, {
        value: entry.value,
        expiresAt: currentTime + this.defaultExpiration,
      });

      return entry.value;
    }

    return undefined;
  }

  public setValue(key: string, value: T, expiration?: number): void {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldestEntry();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (expiration ?? this.defaultExpiration),
    });
  }

  public removeValue(key: string): boolean {
    const entry = this.cache.get(key);

    if (entry) {
      this.cache.delete(key);
      this.onEviction?.(key, entry.value);
      return true;
    }

    return false;
  }

  private evictOldestEntry(): void {
    const keysIterator = this.cache.keys();
    const oldestKey = keysIterator.next().value;

    if (oldestKey !== undefined) {
      const entry = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);

      if (entry) {
        this.onEviction?.(oldestKey, entry.value);
      }
    }
  }

  public getSize(): number {
    return this.cache.size;
  }

  public clearCache(): void {
    if (this.cache.size === 0) {
      return;
    }

    this.cache.clear();
  }

  public updateMaxEntries(newMax: number): void {
    this.maxEntries = newMax;

    while (this.cache.size > this.maxEntries) {
      this.evictOldestEntry();
    }
  }

  public getTimeToExpire(key: string): number | undefined {
    const entry = this.cache.get(key);

    if (entry) {
      const currentTime = Date.now();
      return entry.expiresAt - currentTime;
    }

    return undefined;
  }

  public hasKey(key: string): boolean {
    const entry = this.cache.get(key);

    if (entry) {
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(key);
        this.onEviction?.(key, entry.value);
        return false;
      }

      return true;
    }

    return false;
  }
}

export default LRUCache;
