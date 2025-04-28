import CircularQueueNode from "../classes/CircularQueueNode";

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
