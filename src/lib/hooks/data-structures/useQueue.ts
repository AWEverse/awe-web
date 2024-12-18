import { useState } from 'react';

interface Queue<T> {
  enqueue: (...items: T[]) => void;
  dequeue: () => T | undefined;
  peek: () => T | undefined;
  isEmpty: () => boolean;
  clear: () => void;
  size: () => number;
  items: T[];
}

export const useQueue = <T>(): Queue<T> => {
  const [queue, setQueue] = useState<T[]>([]);

  const enqueue = (...items: T[]): void => {
    setQueue(prevQueue => [...prevQueue, ...items]);
  };

  const dequeue = (): T | undefined => {
    let dequeuedItem: T | undefined;

    setQueue(prevQueue => {
      if (prevQueue.length === 0) return prevQueue;

      const [firstItem, ...restQueue] = prevQueue;

      dequeuedItem = firstItem;
      return restQueue;
    });
    return dequeuedItem;
  };

  const peek = (): T | undefined => {
    return queue.length > 0 ? queue[0] : undefined;
  };

  const isEmpty = (): boolean => {
    return Boolean(queue.length);
  };

  const clear = (): void => {
    setQueue([]);
  };

  const size = (): number => {
    return queue.length;
  };

  return {
    enqueue,
    dequeue,
    peek,
    isEmpty,
    clear,
    size,
    items: queue,
  };
};
