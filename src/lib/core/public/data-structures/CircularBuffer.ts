class CircularBuffer<T> {
  private buffer: (T | null)[];

  private writeIndex = 0;
  private readIndex = 0;

  private count = 0;

  private readonly capacity: number;
  private readonly isPowerOfTwo: boolean;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error("Capacity must be at least 1.");
    }
    this.capacity = capacity;
    this.buffer = new Array<T | null>(capacity).fill(null);
    this.isPowerOfTwo = (capacity & (capacity - 1)) === 0;
  }

  /**
   * Increments an index, wrapping around the buffer.
   * Uses a bitwise AND if capacity is a power of two.
   */
  private incrementIndex(index: number): number {
    return this.isPowerOfTwo
      ? (index + 1) & (this.capacity - 1)
      : (index + 1) % this.capacity;
  }

  /**
   * Attempts to add an item to the buffer.
   * @returns {boolean} True if the item was added; false if the buffer is full.
   */
  public put(item: T): boolean {
    if (this.isFull()) {
      return false; // Buffer is full.
    }

    this.buffer[this.writeIndex] = item;
    this.writeIndex = this.incrementIndex(this.writeIndex);
    this.count++;
    return true;
  }

  /**
   * Retrieves the next item from the buffer.
   * @returns {T | null} The next item, or null if the buffer is empty.
   */
  public get(): T | null {
    if (this.isEmpty()) {
      return null; // Buffer is empty.
    }

    const item = this.buffer[this.readIndex];
    // Clear the slot to allow for garbage collection.
    this.buffer[this.readIndex] = null;
    this.readIndex = this.incrementIndex(this.readIndex);
    this.count--;
    return item;
  }

  /**
   * Returns an array of all items currently in the buffer in order.
   */
  public getAll(): T[] {
    const items: T[] = [];

    for (let i = 0; i < this.count; i++) {
      // Calculate the actual index wrapping around the buffer.
      const index = (this.readIndex + i) % this.capacity;
      // We use the non-null assertion because we know these slots hold valid items.
      items.push(this.buffer[index]!);
    }

    return items;
  }

  /**
   * Calculates the current number of items in the buffer.
   */
  public size(): number {
    return this.count;
  }

  /**
   * Checks if the buffer is full.
   */
  public isFull(): boolean {
    return this.count === this.capacity;
  }

  /**
   * Checks if the buffer is empty.
   */
  public isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Clears the buffer and resets its state.
   */
  public clear(): void {
    this.buffer.fill(null);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.count = 0;
  }
}

export default CircularBuffer;
