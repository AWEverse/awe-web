import { queueMicrotask } from "../polyfill";
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
  #batchSize: number;
  #draining = false;

  #maxNodeSize: number = 2048;
  #minNodeSize: number = 128;
  #resizeThreshold: number = 0.75;
  #shrinkThreshold: number = 0.25;

  constructor(nodeSize: number = 1024, batchSize: number = 50) {
    this.#nodeSize = nodeSize;
    this.#batchSize = batchSize;
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
    if (this.#draining) return;
    this.#draining = true;

    const processBatch = () => {
      const batch: T[] = [];
      while (this.#length > 0 && batch.length < this.#batchSize) {
        let task = this.#tail.dequeue();

        while (task !== null && !this.#set.has(task)) {
          task = this.#tail.dequeue();
        }

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
        queueMicrotask(() => {
          batch.forEach(callback);

          if (this.#length > 0) {
            processBatch();
          } else {
            this.#draining = false;
          }
        });
      } else {
        this.#draining = false;
      }
    };

    processBatch();
  }

  clear(): void {
    this.#set.clear();
    this.#length = 0;
    // Clean up refs for GC
    let node = this.#tail;
    while (node) {
      const next = node.next;
      node.next = null;
      node = next!;
    }
    const newNode = new CircularQueueNode<T>({ size: this.#nodeSize });
    this.#head = newNode;
    this.#tail = newNode;
  }

  private adjustNodeSize(): void {
    const fillRatio = this.#length / this.#nodeSize;
    if (
      fillRatio >= this.#resizeThreshold &&
      this.#nodeSize < this.#maxNodeSize
    ) {
      if (this.#length > this.#nodeSize * 1.5) {
        this.#nodeSize = Math.min(this.#nodeSize * 2, this.#maxNodeSize);
      }
    } else if (
      fillRatio <= this.#shrinkThreshold &&
      this.#nodeSize > this.#minNodeSize
    ) {
      if (this.#length < this.#nodeSize * 0.1) {
        this.#nodeSize = Math.max(this.#nodeSize / 2, this.#minNodeSize);
      }
    }
  }
}
