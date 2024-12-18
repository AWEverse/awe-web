import { useState } from 'react';

interface Stack<T> {
  push: (...items: T[]) => void;
  pop: () => T | undefined;
  peek: () => T | undefined;
  isEmpty: () => boolean;
  clear: () => void;
  size: () => number;
  items: T[];
}

export const useStack = <T>(): Stack<T> => {
  const [stack, setStack] = useState<T[]>([]);

  const push = (...items: T[]): void => {
    setStack(prevStack => [...prevStack, ...items]);
  };

  const pop = (): T | undefined => {
    let poppedItem: T | undefined;
    setStack(prevStack => {
      if (prevStack.length === 0) return prevStack;
      const newStack = [...prevStack];
      poppedItem = newStack.pop();
      return newStack;
    });
    return poppedItem;
  };

  const peek = (): T | undefined => {
    if (stack.length === 0) return undefined;
    return stack[stack.length - 1];
  };

  const isEmpty = (): boolean => {
    return stack.length === 0;
  };

  const clear = (): void => {
    setStack([]);
  };

  const size = (): number => {
    return stack.length;
  };

  return {
    push,
    pop,
    peek,
    isEmpty,
    clear,
    size,
    items: stack,
  };
};
