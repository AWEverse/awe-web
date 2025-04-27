/**
 * A mathematically precise circular buffer for fixed-size FIFO storage.
 * Optimized for low memory and fast read/write operations.
 */
export default class CircularBuffer<T> {
  private readonly buffer: T[];
  private writeIndex = 0;
  private count = 0;

  constructor(readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("Capacity must be a positive integer");
    }
    this.buffer = new Array<T>(capacity);
  }

  /** Writes an item, overwriting oldest if full. */
  public write(item: T): void {
    this.buffer[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    this.count = Math.min(this.count + 1, this.capacity);
  }

  /** Reads all items in chronological order. */
  public readAll(): T[] {
    if (this.count === 0) return [];
    const result = new Array<T>(this.count);
    const start = (this.writeIndex - this.count + this.capacity) % this.capacity;

    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(start + i) % this.capacity];
    }
    return result;
  }

  /** Checks if buffer is full. */
  public isFull(): boolean {
    return this.count === this.capacity;
  }

  /** Checks if buffer is empty. */
  public isEmpty(): boolean {
    return this.count === 0;
  }

  /** Returns current number of items. */
  public size(): number {
    return this.count;
  }

  /** Clears all items. */
  public clear(): void {
    this.writeIndex = 0;
    this.count = 0;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    const items = this.readAll();
    for (const item of items) {
      yield item;
    }
  }
}
