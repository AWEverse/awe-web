Array.prototype.select = function <T, S>(
  this: T[],
  selector: (item: T) => S,
): S[] {
  const result: S[] = [];
  const iterator = this[Symbol.iterator]();

  let current = iterator.next();

  while (!current.done) {
    result.push(selector(current.value));
    current = iterator.next();
  }

  return result;
};

Array.prototype.where = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
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

Array.prototype.aggregate = function <T, S>(
  this: T[],
  seed: S,
  func: (acc: S, item: T) => S,
): S {
  let acc = seed;

  for (const item of this) {
    acc = func(acc, item);
  }

  return acc;
};

Array.prototype.sum = function <T>(
  this: T[],
  selector: (item: T) => number = (item) => Number(item),
): number {
  let sum = 0;

  for (let i = 0; i < this.length; i++) {
    sum += selector(this[i]);
  }

  return sum;
};

Array.prototype.countBy = function <T>(
  this: T[],
  selector: (item: T) => number,
): number {
  return this.aggregate(0, (acc, item) => acc + selector(item));
};

Array.prototype.aggregate = function <T, U>(
  this: T[],
  seed: U,
  func: (acc: U, item: T) => U,
): U {
  let result = seed;

  for (const item of this) {
    result = func(result, item);
  }
  return result;
};

Array.prototype.groupBy = function <T, K>(
  this: T[],
  keySelector: (item: T) => K,
): Map<K, T[]> {
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

Array.prototype.selectMany = function <T, U>(
  this: T[],
  selector: (item: T) => U[],
): U[] {
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

Array.prototype.any = function <T>(
  this: T[],
  predicate?: (item: T) => boolean,
): boolean {
  if (!predicate) {
    return this.length > 0;
  }
  return this.some(predicate);
};

Array.prototype.all = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): boolean {
  return this.every(predicate);
};

Array.prototype.first = function <T>(
  this: T[],
  predicate?: (item: T) => boolean,
): T | undefined {
  const iterator = this[Symbol.iterator]();

  if (predicate) {
    for (const item of iterator) {
      if (predicate(item)) {
        return item;
      }
    }
  } else {
    const { value } = iterator.next();
    return value;
  }
};

Array.prototype.last = function <T>(
  this: T[],
  predicate?: (item: T) => boolean,
): T | undefined {
  const iterator = this[Symbol.iterator]();
  let lastMatch: T | undefined = undefined;

  if (predicate) {
    for (const item of iterator) {
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

Array.prototype.orderBy = function <T, R>(
  this: T[],
  selector: (item: T) => R,
): T[] {
  const MIN_MERGE = 32;

  const minRunLength = (n: number): number => {
    let r = 0;

    while (n >= MIN_MERGE) {
      r |= n & 1;
      n >>= 1;
    }

    return n + r;
  };

  const insertionSort = (
    arr: T[],
    left: number,
    right: number,
    selector: (item: T) => R,
  ): void => {
    for (let i = left + 1; i <= right; i++) {
      const temp = arr[i];
      let j = i - 1;

      while (j >= left && selector(arr[j]) > selector(temp)) {
        arr[j + 1] = arr[j];
        j--;
      }

      arr[j + 1] = temp;
    }
  };

  const merge = (
    arr: T[],
    l: number,
    m: number,
    r: number,
    selector: (item: T) => R,
  ): void => {
    const len1 = m - l + 1;
    const len2 = r - m;

    const left = new Array(len1);
    const right = new Array(len2);

    for (let x = 0; x < len1; x++) {
      left[x] = arr[l + x];
    }
    for (let x = 0; x < len2; x++) {
      right[x] = arr[m + 1 + x];
    }

    let i = 0,
      j = 0,
      k = l;

    while (i < len1 && j < len2) {
      if (selector(left[i]) <= selector(right[j])) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      k++;
    }

    while (i < len1) {
      arr[k] = left[i];
      k++;
      i++;
    }

    while (j < len2) {
      arr[k] = right[j];
      k++;
      j++;
    }
  };

  const timSort = (arr: T[], n: number, selector: (item: T) => R): void => {
    const minRun = minRunLength(MIN_MERGE);

    for (let i = 0; i < n; i += minRun) {
      insertionSort(arr, i, Math.min(i + MIN_MERGE - 1, n - 1), selector);
    }

    for (let size = minRun; size < n; size = 2 * size) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);

        if (mid < right) {
          merge(arr, left, mid, right, selector);
        }
      }
    }
  };

  const arrCopy = [...this];
  timSort(arrCopy, arrCopy.length, selector);
  return arrCopy;
};

Array.prototype.orderByDescending = function <T, R>(
  this: T[],
  selector: (item: T) => R,
): T[] {
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
  return this.filter((item) => !secondArray.includes(item));
};

Array.prototype.union = function <T>(this: T[], secondArray: T[]): T[] {
  return [...new Set([...this, ...secondArray])];
};

Array.prototype.intersect = function <T>(this: T[], secondArray: T[]): T[] {
  return this.filter((item) => secondArray.includes(item));
};

Array.prototype.takeWhile = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
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

Array.prototype.skipWhile = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
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

String.prototype.aggregate = function <S>(
  seed: S,
  func: (acc: S, item: string) => S,
): S {
  let accumulator = seed;
  for (let i = 0; i < this.length; i++) {
    accumulator = func(accumulator, this[i]);
  }
  return accumulator;
};

String.prototype.all = function (
  predicate: (item: string) => boolean,
): boolean {
  for (let i = 0; i < this.length; i++) {
    if (!predicate(this[i])) {
      return false;
    }
  }
  return true;
};

String.prototype.any = function (
  predicate?: (item: string) => boolean,
): boolean {
  if (predicate) {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) {
        return true;
      }
    }
    return false;
  }

  return this.length > 0;
};

String.prototype.contains = function (item: string): boolean {
  return this.includes(item);
};

String.prototype.groupBy = function <K>(
  keySelector: (item: string) => K,
): Map<K, string[]> {
  return Array.from(this).groupBy(keySelector);
};
String.prototype.distinct = function (): string {
  let result = "";

  for (let i = 0; i < this.length; i++) {
    if (!result.includes(this[i])) {
      result += this[i];
    }
  }
  return result;
};

String.prototype.except = function (secondString: string): string {
  let result = "";

  const secondSet = new Set(secondString);

  for (let i = 0; i < this.length; i++) {
    if (!secondSet.has(this[i])) {
      result += this[i];
    }
  }
  return result;
};

String.prototype.first = function (
  predicate?: (item: string) => boolean,
): string | undefined {
  if (predicate) {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) {
        return this[i];
      }
    }
    return undefined;
  }

  return this[0];
};

String.prototype.intersect = function (secondString: string): string {
  const set = new Set(secondString);
  let result = "";

  for (let i = 0; i < this.length; i++) {
    if (set.has(this[i])) {
      result += this[i];
    }
  }

  return result;
};

String.prototype.orderBy = function <R>(selector: (item: string) => R): string {
  return Array.from(this)
    .sort((a, b) => (selector(a) > selector(b) ? 1 : -1))
    .join("");
};

String.prototype.orderByDescending = function <R>(
  selector: (item: string) => R,
): string {
  return Array.from(this).orderByDescending(selector).join("");
};

String.prototype.select = function <R>(selector: (item: string) => R): string {
  let result = "";

  for (let i = 0; i < this.length; i++) {
    result += selector(this[i]);
  }

  return result;
};

String.prototype.skip = function (count: number): string {
  return this.slice(count);
};

String.prototype.skipWhile = function (
  predicate: (item: string) => boolean,
): string {
  let index = 0;

  while (index < this.length && predicate(this[index])) {
    index++;
  }

  return this.slice(index);
};

String.prototype.take = function (count: number): string {
  return this.slice(0, count);
};

String.prototype.takeWhile = function (
  predicate: (item: string) => boolean,
): string {
  let index = 0;
  while (index < this.length && predicate(this[index])) {
    index++;
  }
  return this.slice(0, index);
};

String.prototype.toArray = function (): string[] {
  return Array.from(this);
};

String.prototype.union = function (secondString: string): string {
  const set = new Set(this);
  for (const char of secondString) {
    set.add(char);
  }
  return Array.from(set).join("");
};

String.prototype.where = function (
  predicate: (item: string) => boolean,
): string {
  let result = "";

  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i])) {
      result += this[i];
    }
  }

  return result;
};
