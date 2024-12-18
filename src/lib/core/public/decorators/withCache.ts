// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new WeakMap<AnyFunction, Map<string, { value: any; timeoutId: NodeJS.Timeout }>>();

const CACHE_TIMEOUT = 60000;

export default function withCache<T extends AnyFunction>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    let fnCache = cache.get(fn);
    const cacheKey = args.map(String).join('_');

    if (fnCache) {
      const cached = fnCache.get(cacheKey);
      if (cached) {
        clearTimeout(cached.timeoutId);

        cached.timeoutId = setTimeout(() => {
          fnCache?.delete(cacheKey);
        }, CACHE_TIMEOUT);

        return cached.value;
      }
    } else {
      fnCache = new Map();
      cache.set(fn, fnCache);
    }

    const newValue = fn(...args);

    const timeoutId = setTimeout(() => {
      fnCache?.delete(cacheKey);
    }, CACHE_TIMEOUT);

    fnCache.set(cacheKey, { value: newValue, timeoutId });

    return newValue;
  };
}
