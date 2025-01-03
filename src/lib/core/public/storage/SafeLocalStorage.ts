class SafeLocalStorage {
  /**
   * Retrieves an item from localStorage and parses it into the specified type.
   * @param key - The key of the item to retrieve.
   * @returns The parsed item of type T or null if not found or invalid.
   */
  static getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error parsing item with key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets an item in localStorage after serializing it.
   * @param key - The key under which to store the item.
   * @param value - The value to store.
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item with key "${key}":`, error);
    }
  }

  /**
   * Sets multiple items in localStorage after serializing them.
   * @param items - An object containing key-value pairs to store.
   */
  static setMultipleItems(items: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(items)) {
      this.setItem(key, value);
    }
  }

  /**
   * Removes an item from localStorage.
   * @param key - The key of the item to remove.
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all items from localStorage.
   */
  static clear(): void {
    localStorage.clear();
  }
}

export default SafeLocalStorage;
