export default class CircularBuffer<T> {
  private buffer: T[];
  private writeIndex = 0;
  private count = 0;

  constructor(private readonly capacity: number) {
    if (capacity < 1) throw new Error("Capacity must be > 0");
    this.buffer = new Array<T>(capacity);
  }

  /** Write with overwrite (useful for logs/media) */
  public write(item: T): void {
    this.buffer[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  /** Read items in correct order */
  public readAll(): T[] {
    const result: T[] = new Array(this.count);
    const start = (this.writeIndex - this.count + this.capacity) % this.capacity;

    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(start + i) % this.capacity];
    }

    return result;
  }

  public isFull(): boolean {
    return this.count === this.capacity;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public size(): number {
    return this.count;
  }

  public clear(): void {
    this.writeIndex = 0;
    this.count = 0;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.readAll();
  }
}
