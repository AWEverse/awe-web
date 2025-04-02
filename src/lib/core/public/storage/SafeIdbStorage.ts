/**
 * Enhanced IndexedDB Utilities
 * Optimized for performance and safety with error handling
 */

// Improved type definitions for better type safety
interface DBOptions {
  version?: number;
  upgrade?: (
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number | null,
  ) => void;
  blocked?: () => void;
}

/**
 * Converts IDBRequest to Promise with enhanced error handling and timeout
 */
function promisifyRequest<T = unknown>(
  request: IDBRequest<T> | IDBTransaction,
  timeout: number = 5000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Set timeout for hanging requests
    const timeoutId = setTimeout(() => {
      reject(new Error(`IndexedDB operation timed out after ${timeout}ms`));
    }, timeout);

    // Transaction handling
    if ("oncomplete" in request) {
      request.oncomplete = () => {
        clearTimeout(timeoutId);
        resolve("result" in request ? (request.result as T) : (undefined as T));
      };
    }

    // Success handling
    if ("onsuccess" in request) {
      request.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve(request.result as T);
      };
    }

    // Error handling with detailed information
    const errorHandler = (event: Event) => {
      clearTimeout(timeoutId);
      const target = event.target as IDBRequest;
      const error = target.error || new Error("Unknown IndexedDB Error");
      reject(
        new DOMException(
          `IndexedDB error: ${error.name} - ${error.message}`,
          error.name,
        ),
      );
    };

    // Handle both abort and error events
    if ("onabort" in request) {
      request.onabort = errorHandler;
      request.onerror = errorHandler;
    } else {
      request.onerror = errorHandler;
    }
  });
}

/**
 * Open database with comprehensive configuration and error handling
 */
async function openDB(
  name: string,
  options: DBOptions = {},
): Promise<IDBDatabase> {
  const { version, upgrade, blocked } = options;

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(name, version);

      if (blocked) request.onblocked = blocked;

      if (upgrade) {
        request.onupgradeneeded = (event) => {
          try {
            upgrade(request.result, event.oldVersion, event.newVersion);
          } catch (error) {
            reject(error);
          }
        };
      }

      // Handle successful connection
      request.onsuccess = () => {
        const db = request.result;
        // Handle version changes gracefully
        db.onversionchange = () => {
          db.close();
          // Notify application that a reload might be necessary
          console.warn("Database version changed, please reload the page");
        };
        resolve(db);
      };

      // Handle connection errors
      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create store with optimized transaction handling
 */
function createStore(
  dbName: string,
  storeName: string,
  options: DBOptions = {},
): UseStore {
  // Create a singleton promise for database connection
  let dbPromise: Promise<IDBDatabase> | null = null;

  // Lazy database initialization with connection pooling
  const getDB = () => {
    if (!dbPromise) {
      dbPromise = openDB(dbName, {
        version: options.version || 1,
        upgrade: (db, oldVersion) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
          if (options.upgrade) {
            options.upgrade(db, oldVersion, db.version);
          }
        },
        blocked: options.blocked,
      });

      // Add error handling for the database promise
      dbPromise.catch((err) => {
        // Reset promise on error to allow retry
        dbPromise = null;
        console.error("Database connection error:", err);
      });
    }

    return dbPromise;
  };

  return async (txMode, callback) => {
    try {
      const db = await getDB();
      return await callback(
        db.transaction(storeName, txMode).objectStore(storeName),
      );
    } catch (err) {
      // Connection retry logic for transient errors
      if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" ||
          err.name === "UnknownError" ||
          err.message.includes("connection"))
      ) {
        // Reset connection and retry once
        dbPromise = null;
        const db = await getDB();
        return await callback(
          db.transaction(storeName, txMode).objectStore(storeName),
        );
      }
      throw err;
    }
  };
}

type UseStore = <T>(
  txMode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => T | PromiseLike<T>,
) => Promise<T>;

const storeCache = new Map<string, UseStore>();

/**
 * Get or create store with caching for performance
 */
function getStore(
  dbName: string,
  storeName: string,
  options: DBOptions = {},
): UseStore {
  const key = `${dbName}:${storeName}`;
  if (!storeCache.has(key)) {
    storeCache.set(key, createStore(dbName, storeName, options));
  }
  return storeCache.get(key)!;
}

let defaultStore: UseStore;
const DEFAULT_DB = "keyval-store";
const DEFAULT_STORE = "keyval";

function getDefaultStore(options: DBOptions = {}): UseStore {
  return (
    defaultStore ||
    (defaultStore = getStore(DEFAULT_DB, DEFAULT_STORE, options))
  );
}

/**
 * Safe retrieval with type checking and validation
 */
async function get<T>(
  key: IDBValidKey,
  store = getDefaultStore(),
  validator?: (value: unknown) => boolean,
): Promise<T | undefined> {
  try {
    const value = await store("readonly", (s) =>
      promisifyRequest<T>(s.get(key)),
    );

    if (validator && value !== undefined && !validator(value)) {
      console.warn(`Type validation failed for key "${key}"`);
      return undefined;
    }

    return value;
  } catch (error) {
    console.error(`Error retrieving key "${key}":`, error);
    throw error;
  }
}

/**
 * Enhanced set with retry logic and validation
 */
async function set(
  key: IDBValidKey,
  value: any,
  store = getDefaultStore(),
  retries = 1,
): Promise<void> {
  try {
    if (value === undefined) {
      value = null;
    }

    await store("readwrite", (s) => {
      s.put(value, key);
      return promisifyRequest(s.transaction);
    });
  } catch (error) {
    if (
      retries > 0 &&
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "UnknownError")
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return set(key, value, store, retries - 1);
    }
    console.error(`Error setting key "${key}":`, error);
    throw error;
  }
}

/**
 * Optimized batch operations using transaction batching
 */
async function setMany(
  entries: [IDBValidKey, any][],
  store = getDefaultStore(),
  chunkSize = 100,
): Promise<void> {
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);

    await store("readwrite", (s) => {
      chunk.forEach(([k, v]) => s.put(v === undefined ? null : v, k));
      return promisifyRequest(s.transaction);
    });
  }
}

/**
 * Atomic update with optimistic concurrency control
 */
async function update<T>(
  key: IDBValidKey,
  updater: (old: T | undefined) => T,
  store = getDefaultStore(),
  maxRetries = 3,
): Promise<void> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      await store("readwrite", async (s) => {
        const currentValue = await promisifyRequest<T>(s.get(key));

        try {
          const newValue = updater(currentValue);
          s.put(newValue === undefined ? null : newValue, key);
          return promisifyRequest(s.transaction);
        } catch (e) {
          s.transaction.abort();
          throw e;
        }
      });
      return;
    } catch (error) {
      if (
        ++retries > maxRetries ||
        !(
          error instanceof DOMException &&
          (error.name === "TransactionInactiveError" ||
            error.name === "AbortError")
        )
      ) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 50 * Math.pow(2, retries)),
      );
    }
  }
}

/**
 * Safe delete operation with error handling
 */
async function del(key: IDBValidKey, store = getDefaultStore()): Promise<void> {
  try {
    await store("readwrite", (s) => {
      s.delete(key);
      return promisifyRequest(s.transaction);
    });
  } catch (error) {
    console.error(`Error deleting key "${key}":`, error);
    throw error;
  }
}

/**
 * Optimized batch delete using chunking
 */
async function delMany(
  keys: IDBValidKey[],
  store = getDefaultStore(),
  chunkSize = 100,
): Promise<void> {
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);

    await store("readwrite", (s) => {
      chunk.forEach((k) => s.delete(k));
      return promisifyRequest(s.transaction);
    });
  }
}

/**
 * Clear store with confirmation option
 */
async function clear(
  store = getDefaultStore(),
  confirmation = false,
): Promise<void> {
  if (confirmation === false) {
    throw new Error(
      "Clear operation requires confirmation parameter to be true",
    );
  }

  try {
    await store("readwrite", (s) => {
      s.clear();
      return promisifyRequest(s.transaction);
    });
  } catch (error) {
    console.error("Error clearing store:", error);
    throw error;
  }
}

/**
 * Optimized cursor processing with chunking and cancellation support
 */
async function processCursor(
  store: IDBObjectStore,
  collector: (cursor: IDBCursorWithValue) => void | boolean,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cursorRequest = store.openCursor();

    // Handle cancellation signal
    let aborted = false;
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Operation aborted", "AbortError"));
        return;
      }

      signal.addEventListener(
        "abort",
        () => {
          aborted = true;
          reject(new DOMException("Operation aborted", "AbortError"));
        },
        { once: true },
      );
    }

    cursorRequest.onsuccess = () => {
      if (aborted) return;

      const cursor = cursorRequest.result;
      if (cursor) {
        try {
          // Allow collector to return false to stop iteration
          const shouldContinue = collector(cursor);
          if (shouldContinue === false) {
            resolve();
          } else {
            cursor.continue();
          }
        } catch (e) {
          reject(e);
        }
      } else {
        resolve();
      }
    };

    cursorRequest.onerror = () => {
      reject(cursorRequest.error);
    };
  }).then(() => promisifyRequest(store.transaction));
}

/**
 * Get all keys with pagination support
 */
async function keys<K extends IDBValidKey>(
  store = getDefaultStore(),
  options?: { limit?: number; offset?: number },
): Promise<K[]> {
  return store("readonly", async (s) => {
    if (s.getAllKeys && (!options || (!options.limit && !options.offset))) {
      return promisifyRequest<K[]>(
        s.getAllKeys() as unknown as IDBRequest<K[]>,
      );
    }

    const keys: K[] = [];
    let skipped = 0;
    const limit = options?.limit ?? Infinity;
    const offset = options?.offset ?? 0;

    await processCursor(s, (cursor) => {
      if (skipped < offset) {
        skipped++;
        return true;
      }

      if (keys.length < limit) {
        keys.push(cursor.key as K);
        return keys.length < limit;
      }

      return false; // Stop when we've collected enough
    });

    return keys;
  });
}

/**
 * Get all values with pagination and filtering
 */
async function values<T>(
  store = getDefaultStore(),
  options?: {
    limit?: number;
    offset?: number;
    filter?: (item: T) => boolean;
  },
): Promise<T[]> {
  return store("readonly", async (s) => {
    if (
      s.getAll &&
      (!options || (!options.filter && !options.limit && !options.offset))
    ) {
      return promisifyRequest<T[]>(s.getAll());
    }

    // Manual implementation for browsers without getAll or with filtering/pagination
    const values: T[] = [];
    let skipped = 0;
    const limit = options?.limit ?? Infinity;
    const offset = options?.offset ?? 0;
    const filter = options?.filter;

    await processCursor(s, (cursor) => {
      const value = cursor.value as T;

      if (filter && !filter(value)) {
        return true;
      }

      if (skipped < offset) {
        skipped++;
        return true;
      }

      if (values.length < limit) {
        values.push(value);
        return values.length < limit;
      }

      return false;
    });

    return values;
  });
}

/**
 * Get all entries with pagination, sorting, and filtering
 */
async function entries<K extends IDBValidKey, T>(
  store = getDefaultStore(),
  options?: {
    limit?: number;
    offset?: number;
    filter?: (item: T, key: K) => boolean;
    sort?: (a: [K, T], b: [K, T]) => number;
  },
): Promise<Array<[K, T]>> {
  return store("readonly", async (s) => {
    if (
      s.getAllKeys &&
      s.getAll &&
      (!options ||
        (!options.filter && !options.sort && !options.limit && !options.offset))
    ) {
      const [keys, vals] = await Promise.all([
        promisifyRequest<K[]>(s.getAllKeys() as unknown as IDBRequest<K[]>),
        promisifyRequest<T[]>(s.getAll()),
      ]);
      return keys.map((k, i) => [k, vals[i]] as [K, T]);
    }

    let entries: Array<[K, T]> = [];

    await processCursor(s, (cursor) => {
      const key = cursor.key as K;
      const value = cursor.value as T;

      if (!options?.filter || options.filter(value, key)) {
        entries.push([key, value]);
      }
      return true;
    });

    if (options?.sort) {
      entries.sort(options.sort);
    }

    if (options?.offset || options?.limit) {
      const offset = options?.offset || 0;
      const limit = options?.limit || entries.length;
      entries = entries.slice(offset, offset + limit);
    }

    return entries;
  });
}

/**
 * Count items with optional query
 */
async function count(
  store = getDefaultStore(),
  query?: IDBValidKey | IDBKeyRange,
): Promise<number> {
  return store("readonly", (s) => promisifyRequest<number>(s.count(query)));
}

/**
 * Check if a key exists
 */
async function hasKey(
  key: IDBValidKey,
  store = getDefaultStore(),
): Promise<boolean> {
  return store("readonly", async (s) => {
    const count = await promisifyRequest<number>(s.count(key));
    return count > 0;
  });
}

/**
 * Get many items by keys
 */
async function getMany<T>(
  keys: IDBValidKey[],
  store = getDefaultStore(),
): Promise<Array<T | undefined>> {
  return store("readonly", async (s) => {
    return Promise.all(keys.map((key) => promisifyRequest<T>(s.get(key))));
  });
}

/**
 * Create a transaction and execute a function within it
 */
async function transaction<T>(
  mode: IDBTransactionMode,
  callback: (txn: IDBTransaction) => Promise<T> | T,
  storeNames: string | string[] = DEFAULT_STORE,
  dbName: string = DEFAULT_DB,
): Promise<T> {
  const db = await openDB(dbName);
  const txn = db.transaction(storeNames, mode);

  try {
    const result = await Promise.resolve(callback(txn));
    await promisifyRequest(txn);
    return result;
  } catch (err) {
    // Ensure transaction is aborted on error
    try {
      txn.abort();
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export default {
  // Core operations
  get,
  set,
  del,
  update,
  clear,

  // Batch operations
  setMany,
  delMany,
  getMany,

  // Query operations
  keys,
  values,
  entries,
  count,
  hasKey,

  // Advanced utilities
  createStore,
  getStore,
  openDB,
  transaction,
  processCursor,
};
