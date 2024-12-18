import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  loop?: boolean; // Added loop option
}

const useCounter = ({ initialValue = 0, min = -Infinity, max = Infinity, loop = false }: UseCounterOptions) => {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prevCount => {
      if (loop) {
        return prevCount >= max ? min : prevCount + 1;
      } else {
        return Math.min(prevCount + 1, max);
      }
    });
  }, [min, max, loop]);

  const decrement = useCallback(() => {
    setCount(prevCount => {
      if (loop) {
        return prevCount <= min ? max : prevCount - 1;
      } else {
        return Math.max(prevCount - 1, min);
      }
    });
  }, [min, max, loop]);

  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
  };
};

export default useCounter;
