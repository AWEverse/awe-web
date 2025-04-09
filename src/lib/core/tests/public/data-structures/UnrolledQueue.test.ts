import { UnrolledQueue } from "@/lib/core/public/data-structures/UnrolledQueue";

describe("UnrolledQueue", () => {
  it("should enqueue and dequeue items correctly", () => {
    const queue = new UnrolledQueue<number>(3);

    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);

    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.size()).toBe(2);
  });

  it("should handle clearing", () => {
    const queue = new UnrolledQueue<string>();
    queue.enqueue("a");
    queue.enqueue("b");
    queue.clear();

    expect(queue.isEmpty()).toBe(true);
    expect(queue.dequeue()).toBe(null);
  });

  it("should iterate synchronously", () => {
    const queue = new UnrolledQueue<number>();
    [1, 2, 3].forEach(n => queue.enqueue(n));

    const result = [...queue];
    expect(result).toEqual([1, 2, 3]);
  });

  it("should support async iteration", async () => {
    const queue = new UnrolledQueue<string>();
    ["x", "y", "z"].forEach(s => queue.enqueue(s));

    const result: string[] = [];
    for await (const item of queue) {
      result.push(item);
    }

    expect(result).toEqual(["x", "y", "z"]);
  });
});
