export default class CircularQueueNode<T> {
  public length = 0;
  public next: CircularQueueNode<T> | null = null;

  private readonly size: number;
  private readonly buffer: (T | null)[];
  private readIndex = 0;
  private writeIndex = 0;

  constructor({ size }: { size: number }) {
    this.size = size;
    this.buffer = new Array<T | null>(size);
  }

  enqueue(item: T): boolean {
    if (this.length === this.size) return false;
    this.buffer[this.writeIndex++] = item;
    if (this.writeIndex === this.size) this.writeIndex = 0;
    this.length++;
    return true;
  }

  dequeue(): T | null {
    if (this.length === 0) return null;
    const item = this.buffer[this.readIndex];
    this.buffer[this.readIndex++] = null;
    if (this.readIndex === this.size) this.readIndex = 0;
    this.length--;
    return item;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }
}
