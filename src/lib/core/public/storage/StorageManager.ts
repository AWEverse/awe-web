import CompressionUtils from "../misc/CompressionUtils";
import SafeIdbStorage from "./SafeIdbStorage";

const STORAGE_PREFIX = "store_v1_";

let saveQueue: Promise<void> = Promise.resolve();

/**
 * Enhanced storage manager with safety features
 */
export default {
  /**
   * Get data with validation and migration support
   */
  async load<T>(key: string): Promise<T | null> {
    try {
      const versionedKey = `${STORAGE_PREFIX}${key}`;
      let compressed = await SafeIdbStorage.get<string>(versionedKey);

      if (!compressed && versionedKey !== key) {
        compressed = await SafeIdbStorage.get<string>(key);

        if (compressed) {
          await SafeIdbStorage.set(versionedKey, compressed);
        }
      }

      if (!compressed) return null;

      const decompressed = CompressionUtils.decompress(compressed);
      const parsed = JSON.parse(decompressed);

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error("Invalid state format");
      }

      return parsed as T;
    } catch (error) {
      console.error(`Failed to load state from cache (${key}):`, error);
      return null;
    }
  },

  /**
   * Save data with transactional safety
   */
  async save<T>(key: string, state: T): Promise<boolean> {
    return new Promise((resolve) => {
      saveQueue = saveQueue.then(async () => {
        try {
          const stateString = JSON.stringify(state);
          const compressed = CompressionUtils.compress(stateString);

          const versionedKey = `${STORAGE_PREFIX}${key}`;
          await SafeIdbStorage.set(versionedKey, compressed);

          resolve(true);
        } catch (error) {
          console.error(`Failed to save state to cache (${key}):`, error);
          resolve(false);
        }
      });
    });
  },

  /**
   * Clear stored data
   */
  async clear(key: string): Promise<void> {
    const versionedKey = `${STORAGE_PREFIX}${key}`;
    await SafeIdbStorage.del(versionedKey);
    await SafeIdbStorage.del(key); // Also clear legacy key
  }
};
