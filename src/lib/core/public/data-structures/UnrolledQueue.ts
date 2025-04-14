class Node<T> {
  public items: T[] = [];
  public next: Node<T> | null = null;
}

export class UnrolledQueue<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private _size = 0;

  constructor(private readonly chunkSize = 2048) { }

  enqueue(item: T): void {
    if (!this.tail || this.tail.items.length >= this.chunkSize) {
      const newNode = new Node<T>();
      if (this.tail) {
        this.tail.next = newNode;
      } else {
        this.head = newNode;
      }
      this.tail = newNode;
    }
    this.tail.items.push(item);
    this._size++;
  }

  dequeue(): T | null {
    if (!this.head) return null;

    const item = this.head.items.shift() ?? null;
    if (item !== null) {
      this._size--;
      if (this.head.items.length === 0) {
        this.head = this.head.next;
        if (!this.head) this.tail = null;
      }
    }
    return item;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current) {
      for (const item of current.items) {
        yield item;
      }
      current = current.next;
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for (const item of this) {
      yield await Promise.resolve(item);
    }
  }

  toArray(): T[] {
    return [...this];
  }
}

