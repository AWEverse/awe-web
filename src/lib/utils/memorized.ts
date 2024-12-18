import { areSortedArraysEqual } from './iteratees';

type Value = { lastArgs: unknown[]; lastResult: unknown };

const cache = new WeakMap<AnyFunction, Value>();

export default function memorized<T extends AnyFunction>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const cached = cache.get(fn);

    if (cached && areSortedArraysEqual(cached.lastArgs, args)) {
      return cached.lastResult as ReturnType<T>;
    }

    const result = fn(...args);
    cache.set(fn, { lastArgs: args, lastResult: result });

    return result;
  }) as T;
}
