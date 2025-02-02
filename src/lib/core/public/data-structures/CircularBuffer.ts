class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private capacity: number;
  private writeIndex = 0;
  private readIndex = 0;
  private full = false;

  constructor(capacity: number) {
    if (capacity < 2) {
      throw new Error(
        "Capacity must be at least 2 to store at least one item.",
      );
    }
    this.capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  public put(item: T): boolean {
    if (this.isFull()) {
      return false; // buffer full
    }

    this.buffer[this.writeIndex] = item;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;

    if (this.writeIndex === this.readIndex) {
      this.full = true;
    }

    return true;
  }

  public get(): T | undefined {
    if (this.isEmpty()) {
      return undefined; // buffer empty
    }

    const item = this.buffer[this.readIndex];
    this.readIndex = (this.readIndex + 1) % this.capacity;
    this.full = false;

    return item;
  }

  public getAll(): T[] {
    const items: T[] = [];
    let index = this.readIndex;

    while (index !== this.writeIndex || this.full) {
      items.push(this.buffer[index] as T);
      index = (index + 1) % this.capacity;
      if (index === this.writeIndex) {
        break;
      }
    }

    return items;
  }

  public size(): number {
    if (this.isFull()) {
      return this.capacity;
    }

    if (this.writeIndex >= this.readIndex) {
      return this.writeIndex - this.readIndex;
    }

    return this.capacity - (this.readIndex - this.writeIndex);
  }

  public isFull(): boolean {
    return this.full;
  }

  public isEmpty(): boolean {
    return !this.full && this.writeIndex === this.readIndex;
  }

  public clear(): void {
    this.writeIndex = 0;
    this.readIndex = 0;
    this.full = false;
    this.buffer.fill(undefined);
  }
}

export default CircularBuffer;
