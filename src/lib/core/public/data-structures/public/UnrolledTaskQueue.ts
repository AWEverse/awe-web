import CircularQueueNode from "../classes/CircularQueueNode";

/**
 * Interface for a generic task queue.
 *
 * @template T The type of task stored in the queue.
 */
interface TaskQueue<T> {
  /** The current number of tasks in the queue. */
  readonly length: number;
  /** Checks if a task exists in the queue. */
  has(task: T): boolean;
  /** Adds a task to the queue if it does not already exist. */
  add(task: T): void;
  /** Removes a task from the queue. */
  delete(task: T): void;
  /**
   * Asynchronously drains the queue, invoking the callback for each task.
   * Tasks are processed in batches to avoid blocking the event loop.
   * @param callback Function to process each task.
   */
  drainEach(callback: (task: T) => void): void;
  /** Clears all tasks from the queue. */
  clear(): void;
}

/**
 * UnrolledTaskQueue is a high-performance, batch-processing task queue.
 *
 * - Uses an unrolled linked list for efficient memory usage and fast operations.
 * - Maintains a Set for O(1) task existence checks and removals.
 * - Supports dynamic node resizing for optimal memory and speed.
 * - Processes tasks in batches using queueMicrotask, ideal for DOM mutation phases.
 * - Lazy removal of deleted tasks from the queue.
 * - Ensures only one drain operation runs at a time.
 *
 * @template T The type of task stored in the queue.
 */
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

  /**
   * Creates a new UnrolledTaskQueue.
   * @param nodeSize The size of each node in the unrolled linked list (default: 1024).
   * @param batchSize The number of tasks to process per batch (default: 50).
   */
  constructor(nodeSize: number = 1024, batchSize: number = 50) {
    this.#nodeSize = nodeSize;
    this.#batchSize = batchSize;
    const node = new CircularQueueNode<T>({ size: this.#nodeSize });
    this.#head = node;
    this.#tail = node;
  }

  /** The current number of tasks in the queue. */
  get length(): number {
    return this.#length;
  }

  /** Checks if a task exists in the queue. */
  has(task: T): boolean {
    return this.#set.has(task);
  }

  /** Adds a task to the queue if it does not already exist. */
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

  /** Removes a task from the queue. */
  delete(task: T): void {
    if (this.#set.delete(task)) {
      this.#length--;
    }
  }

  /**
   * Asynchronously drains the queue, invoking the callback for each task.
   * Tasks are processed in batches using queueMicrotask to avoid blocking the event loop
   * and to ensure execution after DOM mutation phases.
   * @param callback Function to process each task.
   */
  drainEach(callback: (task: T) => void): void {
    if (this.#draining) return;
    this.#draining = true;

    const processBatch = () => {
      const batch: T[] = [];
      while (this.#length > 0 && batch.length < this.#batchSize) {
        let task = this.#tail.dequeue();

        // Skip tasks that have been deleted from the Set
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

  /** Clears all tasks from the queue and releases memory. */
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

  /**
   * Dynamically adjusts the node size for optimal memory and performance.
   * Increases or decreases node size based on the current fill ratio.
   * @private
   */
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
