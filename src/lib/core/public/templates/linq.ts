Array.prototype.select = function <T, S>(this: T[], selector: (item: T) => S): S[] {
  const result: S[] = [];
  const iterator = this[Symbol.iterator]();

  let current = iterator.next();

  while (!current.done) {
    result.push(selector(current.value));
    current = iterator.next();
  }

  return result;
};

Array.prototype.where = function <T>(this: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  const iterator = this[Symbol.iterator]();

  let current = iterator.next();

  while (!current.done) {
    if (predicate(current.value)) {
      result.push(current.value);
    }
    current = iterator.next();
  }

  return result;
};

Array.prototype.aggregate = function <T, S>(this: T[], seed: S, func: (acc: S, item: T) => S): S {
  let acc = seed;

  for (const item of this) {
    acc = func(acc, item);
  }

  return acc;
};

Array.prototype.sum = function <T>(
  this: T[],
  selector: (item: T) => number = item => Number(item),
): number {
  return this.aggregate(0, (acc, item) => acc + selector(item));
};

Array.prototype.countBy = function <T>(this: T[], selector: (item: T) => number): number {
  return this.aggregate(0, (acc, item) => acc + selector(item));
};

Array.prototype.aggregate = function <T, U>(this: T[], seed: U, func: (acc: U, item: T) => U): U {
  let result = seed;

  for (const item of this) {
    result = func(result, item);
  }
  return result;
};

Array.prototype.groupBy = function <T, K>(this: T[], keySelector: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of this) {
    const key = keySelector(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
};

Array.prototype.zip = function <T, U, V>(
  this: T[],
  secondArray: U[],
  resultSelector: (first: T, second: U) => V,
): V[] {
  const length = Math.min(this.length, secondArray.length);
  const result: V[] = [];

  for (let i = 0; i < length; i++) {
    result.push(resultSelector(this[i], secondArray[i]));
  }
  return result;
};

Array.prototype.selectMany = function <T, U>(this: T[], selector: (item: T) => U[]): U[] {
  return this.reduce((acc, item) => acc.concat(selector(item)), [] as U[]);
};

Array.prototype.joins = function <T, U, K, V>(
  this: T[], // outerArray
  innerArray: U[],
  outerKeySelector: (outer: T) => K,
  innerKeySelector: (inner: U) => K,
  resultSelector: (outer: T, inner: U) => V,
): V[] {
  const results: V[] = [];
  const lookup = new Map<K, U[]>();

  for (const inner of innerArray) {
    const key = innerKeySelector(inner);

    if (!lookup.has(key)) {
      lookup.set(key, []);
    }

    lookup.get(key)!.push(inner);
  }

  for (const outer of this) {
    const key = outerKeySelector(outer);
    const matchedInners = lookup.get(key);

    if (matchedInners) {
      for (const inner of matchedInners) {
        results.push(resultSelector(outer, inner));
      }
    }
  }

  return results;
};

Array.prototype.any = function <T>(this: T[], predicate?: (item: T) => boolean): boolean {
  if (!predicate) {
    return this.length > 0;
  }
  return this.some(predicate);
};

Array.prototype.all = function <T>(this: T[], predicate: (item: T) => boolean): boolean {
  return this.every(predicate);
};

Array.prototype.first = function <T>(this: T[], predicate?: (item: T) => boolean): T | undefined {
  const iterator = this[Symbol.iterator]();

  if (predicate) {
    for (let item of iterator) {
      if (predicate(item)) {
        return item;
      }
    }
  } else {
    const { value } = iterator.next();
    return value;
  }
};

Array.prototype.last = function <T>(this: T[], predicate?: (item: T) => boolean): T | undefined {
  const iterator = this[Symbol.iterator]();
  let lastMatch: T | undefined = undefined;

  if (predicate) {
    for (let item of iterator) {
      if (predicate(item)) {
        lastMatch = item;
      }
    }
    return lastMatch;
  } else {
    let result = iterator.next();

    while (!result.done) {
      lastMatch = result.value;
      result = iterator.next();
    }
    return lastMatch;
  }
};

Array.prototype.distinct = function <T>(this: T[]): T[] {
  return [...new Set(this)];
};

Array.prototype.orderBy = function <T>(this: T[], selector: (item: T) => any): T[] {
  const merge = (left: T[], right: T[], selector: (item: T) => any): T[] => {
    const result: T[] = [];
    let leftIndex = 0,
      rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftValue = selector(left[leftIndex]);
      const rightValue = selector(right[rightIndex]);

      if (
        leftValue < rightValue ||
        (leftValue === rightValue && left[leftIndex] < right[rightIndex])
      ) {
        result.push(left[leftIndex++]);
      } else {
        result.push(right[rightIndex++]);
      }
    }

    return result.concat(left.slice(leftIndex), right.slice(rightIndex));
  };

  const mergeSort = (array: T[], selector: (item: T) => any): T[] => {
    if (array.length <= 1) return array;

    const mid = Math.floor(array.length / 2);
    const left = mergeSort(array.slice(0, mid), selector);
    const right = mergeSort(array.slice(mid), selector);

    return merge(left, right, selector);
  };

  return mergeSort([...this], selector);
};

Array.prototype.orderByDescending = function <T>(this: T[], selector: (item: T) => any): T[] {
  return this.orderBy(selector).reverse();
};

Array.prototype.skip = function <T>(this: T[], count: number): T[] {
  return this.slice(count);
};

Array.prototype.take = function <T>(this: T[], count: number): T[] {
  return this.slice(0, count);
};

Array.prototype.contains = function <T>(this: T[], item: T): boolean {
  return this.includes(item);
};

Array.prototype.toArray = function <T>(this: T[]): T[] {
  return [...this];
};

Array.prototype.except = function <T>(this: T[], secondArray: T[]): T[] {
  return this.filter(item => !secondArray.includes(item));
};

Array.prototype.union = function <T>(this: T[], secondArray: T[]): T[] {
  return [...new Set([...this, ...secondArray])];
};

Array.prototype.intersect = function <T>(this: T[], secondArray: T[]): T[] {
  return this.filter(item => secondArray.includes(item));
};

Array.prototype.takeWhile = function <T>(this: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];

  for (const item of this) {
    if (predicate(item)) {
      result.push(item);
    } else {
      break;
    }
  }

  return result;
};

Array.prototype.skipWhile = function <T>(this: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  let skipping = true;

  for (const item of this) {
    if (skipping && predicate(item)) {
      continue;
    }
    skipping = false;
    result.push(item);
  }

  return result;
};

// arr.select(x => x * 2).any(x => x > 10);

/*
  {
  const p1 = x => x * 2;
  const p2 = x => x > 10;

  for (const item of arr) {
    if (p1(item) && p2(item)) {
      return true;
    }
  }
*/
