export interface CircularQueueNodeOptions {
  size: number;
}

export class CircularQueueNode<T> {
  public length = 0;
  public next: CircularQueueNode<T> | null = null;

  private readonly size: number;
  private readonly buffer: (T | null)[];
  private readIndex = 0;
  private writeIndex = 0;

  constructor({ size }: CircularQueueNodeOptions) {
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

export interface UnrolledQueueOptions {
  nodeSize?: number;
}

export default class UnrolledQueue<T> {
  #length = 0;
  #nodeSize: number;
  #head: CircularQueueNode<T>;
  #tail: CircularQueueNode<T>;

  constructor(options: UnrolledQueueOptions = {}) {
    this.#nodeSize = options.nodeSize ?? 2048;
    const node = new CircularQueueNode<T>({ size: this.#nodeSize });
    this.#head = node;
    this.#tail = node;
  }

  get length(): number {
    return this.#length;
  }

  enqueue(item: T): void {
    if (!this.#head.enqueue(item)) {
      const newNode = new CircularQueueNode<T>({ size: this.#nodeSize });
      this.#head.next = newNode;
      this.#head = newNode;
      this.#head.enqueue(item);
    }

    this.#length++;
  }

  dequeue(): T | null {
    if (this.#length === 0) return null;
    const item = this.#tail.dequeue();
    this.#length--;
    if (this.#tail.length === 0 && this.#tail.next) {
      this.#tail = this.#tail.next;
    }
    return item;
  }
}
