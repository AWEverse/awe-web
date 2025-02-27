/**
 * SafeLocalStorage
 *
 * Расширяет базовый функционал работы с localStorage:
 * - Безопасное получение и установку значений с обработкой JSON.
 * - Групповое (batch) выполнение операций: возможность накапливать операции
 *   и затем применять их все разом (commit) или откатывать (rollback).
 * - Поддержка отмены операций через AbortController.
 */
class SafeLocalStorage {
  private static batchQueue: Array<{ type: 'set' | 'remove'; key: string; value?: unknown }> = [];
  private static isBatching = false;

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

  static setItem<T>(key: string, value: T): void {
    if (this.isBatching) {
      this.batchQueue.push({ type: 'set', key, value });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting item with key "${key}":`, error);
      }
    }
  }

  static removeItem(key: string): void {
    if (this.isBatching) {
      this.batchQueue.push({ type: 'remove', key });
    } else {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item with key "${key}":`, error);
      }
    }
  }

  static setMultipleItems(items: Record<string, unknown>): void {
    if (this.isBatching) {
      for (const [key, value] of Object.entries(items)) {
        this.batchQueue.push({ type: 'set', key, value });
      }
    } else {
      for (const [key, value] of Object.entries(items)) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting item with key "${key}":`, error);
        }
      }
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
      this.batchQueue = [];
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  static beginBatch(): void {
    this.isBatching = true;
    this.batchQueue = [];
  }

  static commitBatch(): void {
    for (const op of this.batchQueue) {
      if (op.type === 'set') {
        try {
          localStorage.setItem(op.key, JSON.stringify(op.value));
        } catch (error) {
          console.error(`Error setting item with key "${op.key}" in batch:`, error);
        }
      } else if (op.type === 'remove') {
        try {
          localStorage.removeItem(op.key);
        } catch (error) {
          console.error(`Error removing item with key "${op.key}" in batch:`, error);
        }
      }
    }
    this.batchQueue = [];
    this.isBatching = false;
  }

  static rollbackBatch(): void {
    this.batchQueue = [];
    this.isBatching = false;
  }

  /**
   * Выполняет заданную функцию в контексте batch-режима.
   * Если функция завершается без ошибок, все операции применяются (commit).
   * В противном случае происходит откат (rollback) и ошибка пробрасывается далее.
   * Если предоставлен AbortSignal и он отменен, выполняется откат.
   *
   * @param callback - Функция, содержащая операции с localStorage.
   * @param options - Опции, включая AbortSignal для отмены операции.
   */
  static batch(callback: () => void, options?: { signal?: AbortSignal }): void {
    const signal = options?.signal;

    if (signal?.aborted) {
      throw new DOMException('Batch operation aborted', 'AbortError');
    }

    this.beginBatch();
    try {
      callback();

      if (signal?.aborted) {
        throw new DOMException('Batch operation aborted during execution', 'AbortError');
      }

      this.commitBatch();
    } catch (error) {
      this.rollbackBatch();
      throw error;
    }
  }
}

export default SafeLocalStorage;
