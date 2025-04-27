import { CircularQueueNode } from "./UnrolledQueue";

export type TaskFunction = () => void;

export interface TaskQueue<T> {
  readonly length: number;
  has(task: T): boolean;
  add(task: T): void;
  delete(task: T): void;
  drainEach(callback: (task: T) => void): void;
  clear(): void;
}

export default class UnrolledTaskQueue<T> implements TaskQueue<T> {
  #length = 0;
  #nodeSize: number;
  #head: CircularQueueNode<T>;
  #tail: CircularQueueNode<T>;
  #set: Set<T> = new Set();

  #maxNodeSize: number = 2048;
  #minNodeSize: number = 128;
  #resizeThreshold: number = 0.75;
  #shrinkThreshold: number = 0.25;

  constructor(nodeSize: number = 1024) {
    this.#nodeSize = nodeSize;
    const node = new CircularQueueNode<T>({ size: this.#nodeSize });
    this.#head = node;
    this.#tail = node;
  }

  get length(): number {
    return this.#length;
  }

  has(task: T): boolean {
    return this.#set.has(task);
  }

  add(task: T): void {
    if (this.#set.has(task)) return;

    if (!this.#head.enqueue(task)) {
      this.adjustNodeSize();

      const newNode = new CircularQueueNode<T>({ size: this.#nodeSize });
      this.#head.next = newNode;
      this.#head = newNode;
      this.#head.enqueue(task);
    }

    this.#set.add(task);
    this.#length++;
  }

  delete(task: T): void {
    if (this.#set.delete(task)) {
      this.#length--;
    }
  }

  drainEach(callback: (task: T) => void): void {
    const batch: T[] = [];
    while (this.#length > 0 && batch.length < 50) {
      const task = this.#tail.dequeue();
      if (task !== null && this.#set.has(task)) {
        this.#set.delete(task);
        this.#length--;
        batch.push(task);
      }
      if (this.#tail.isEmpty() && this.#tail.next) {
        this.#tail = this.#tail.next;
      }
    }
    if (batch.length > 0) {
      requestAnimationFrame(() => batch.forEach(callback));
    }
  }

  clear(): void {
    this.#set.clear();
    this.#length = 0;
    const node = new CircularQueueNode<T>({ size: this.#nodeSize });
    this.#head = node;
    this.#tail = node;
  }

  private adjustNodeSize(): void {
    const fillRatio = this.#length / this.#nodeSize;
    if (fillRatio >= this.#resizeThreshold && this.#nodeSize < this.#maxNodeSize) {
      if (this.#length > this.#nodeSize * 1.5) {
        this.#nodeSize = Math.min(this.#nodeSize * 2, this.#maxNodeSize);
      }
    } else if (fillRatio <= this.#shrinkThreshold && this.#nodeSize > this.#minNodeSize) {
      if (this.#length < this.#nodeSize * 0.1) {
        this.#nodeSize = Math.max(this.#nodeSize / 2, this.#minNodeSize);
      }
    }
  }
}
