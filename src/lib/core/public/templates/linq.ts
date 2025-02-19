if (!Array.prototype.select) {
  Object.defineProperty(Array.prototype, "select", {
    value: function <T, S>(
      this: T[],
      selector: (item: T, index: number, array: T[]) => S,
    ): S[] {
      if (typeof selector !== "function")
        throw new TypeError("Selector must be a function");

      const length = this.length;
      const result = new Array<S>(length);
      let count = 0;

      for (let i = 0; i < length; i++) {
        if (i in this) {
          result[count++] = selector(this[i], i, this);
        }
      }

      result.length = count;
      return result;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

if (!Array.prototype.where) {
  Object.defineProperty(Array.prototype, "where", {
    value: function <T>(
      this: T[],
      predicate: (item: T, index: number, array: T[]) => boolean,
    ): T[] {
      if (typeof predicate !== "function")
        throw new TypeError("Predicate must be a function");

      const length = this.length;
      const result: T[] = [];
      // Loop over the array and push items that satisfy the predicate
      for (let i = 0; i < length; i++) {
        if (i in this && predicate(this[i], i, this)) {
          result.push(this[i]);
        }
      }
      return result;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

Array.prototype.aggregate = function <T, U>(
  this: T[],
  seed: U,
  func: (acc: U, item: T) => U,
): U {
  if (typeof func !== "function")
    throw new TypeError("Aggregator must be a function");

  let acc = seed;
  const length = this.length;
  let i = 0;

  // Unroll loop in blocks of 8 for better performance
  for (; i < length - 7; i += 8) {
    acc = func(acc, this[i]);
    acc = func(acc, this[i + 1]);
    acc = func(acc, this[i + 2]);
    acc = func(acc, this[i + 3]);
    acc = func(acc, this[i + 4]);
    acc = func(acc, this[i + 5]);
    acc = func(acc, this[i + 6]);
    acc = func(acc, this[i + 7]);
  }

  // Process remaining elements
  for (; i < length; i++) {
    acc = func(acc, this[i]);
  }

  return acc;
};

Array.prototype.sum = function <T>(
  this: T[],
  selector: (item: T) => number = Number,
): number {
  if (typeof selector !== "function")
    throw new TypeError("Selector must be a function");

  let sum = 0;
  let compensation = 0; // Kahan summation compensation
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      const y = selector(this[i]) - compensation;
      const t = sum + y;
      compensation = t - sum - y;
      sum = t;
    }
  }

  return sum - compensation;
};

Array.prototype.countBy = function <T>(
  this: T[],
  selector: (item: T) => number,
): number {
  if (typeof selector !== "function")
    throw new TypeError("Selector must be a function");

  const map = new Map<number, number>();
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      const key = selector(this[i]);
      map.set(key, (map.get(key) || 0) + 1);
    }
  }

  return Array.from(map.values()).reduce((a, b) => a + b, 0);
};

Array.prototype.groupBy = function <T, K>(
  this: T[],
  keySelector: (item: T) => K,
): Map<K, T[]> {
  if (typeof keySelector !== "function") {
    throw new TypeError("Key selector must be a function");
  }

  const map = new Map<K, T[]>();
  const length = this.length;
  let i = 0;

  while (i < length) {
    if (i in this) {
      const item = this[i];
      const key = keySelector(item);

      let bucket = map.get(key);
      if (bucket === void 0) {
        bucket = [];
        map.set(key, bucket);
      }
      bucket[bucket.length] = item;
    }
    i++;
  }

  return map;
};

Array.prototype.zip = function <T, U, V>(
  this: T[],
  secondArray: U[],
  resultSelector: (first: T, second: U) => V,
): V[] {
  // Validate inputs
  if (typeof resultSelector !== "function") {
    throw new TypeError("Result selector must be a function");
  }
  if (!Array.isArray(secondArray)) {
    throw new TypeError("Second argument must be an array");
  }

  const a = this;
  const b = secondArray;
  const minLength = Math.min(a.length, b.length);
  const result = new Array<V>(minLength);

  // Fast path for dense arrays
  if (a.length === b.length && a.length === minLength) {
    for (let i = 0; i < minLength; i += 8) {
      const remaining = Math.min(8, minLength - i);
      for (let j = 0; j < remaining; j++) {
        const idx = i + j;
        result[idx] = resultSelector(a[idx], b[idx]);
      }
    }
  } else {
    // Sparse array handling with bounds checking
    let count = 0;
    for (let i = 0; i < minLength; i++) {
      if (a.hasOwnProperty(i) && b.hasOwnProperty(i)) {
        result[count++] = resultSelector(a[i], b[i]);
      }
    }
    result.length = count; // Truncate array to actual size
  }

  return result;
};

Array.prototype.selectMany = function <T, U>(
  this: T[],
  selector: (item: T) => U[],
): U[] {
  if (typeof selector !== "function") {
    throw new TypeError("Selector must be a function");
  }

  const source = this;
  const sourceLength = source.length >>> 0;
  const nestedArrays: U[][] = [];
  let totalLength = 0;

  for (let i = 0; i < sourceLength; i++) {
    if (i in source) {
      const item = source[i];
      let nested: U[];

      try {
        nested = selector(item);
      } catch (e) {
        throw new Error(`Selector error at index ${i}: ${(e as Error).message}`);
      }

      if (!Array.isArray(nested)) {
        throw new TypeError(`Selector must return an array (got ${typeof nested} at index ${i})`);
      }

      const nestedLength = nested.length;
      if (nestedLength > 0) {
        nestedArrays.push(nested);
        totalLength += nestedLength >>> 0;
      }
    }
  }

  const result = new Array<U>(totalLength);
  let offset = 0;

  for (let i = 0; i < nestedArrays.length; ++i) {
    const arr = nestedArrays[i];

    const len = arr.length;

    if (len > 1000) {
      result.splice(offset, len, ...arr);
    } else if (len > 0) {
      for (let i = 0; i < len; i++) {
        result[offset + i] = arr[i];
      }
    }
    offset += len;
  }

  return result;
};

Array.prototype.joins = function <T, U, K, V>(
  this: T[],
  innerArray: U[],
  outerKeySelector: (outer: T) => K,
  innerKeySelector: (inner: U) => K,
  resultSelector: (outer: T, inner: U) => V,
): V[] {
  // Validate input functions
  if (
    typeof outerKeySelector !== "function" ||
    typeof innerKeySelector !== "function" ||
    typeof resultSelector !== "function"
  ) {
    throw new TypeError("All selector arguments must be functions");
  }

  // Create optimized lookup structure
  const lookup = new Map<K, U[]>();
  const innerLen = innerArray.length;

  // Build lookup table with pre-allocation
  for (let i = 0; i < innerLen; i++) {
    if (i in innerArray) {
      const item = innerArray[i];
      const key = innerKeySelector(item);
      const group = lookup.get(key);
      if (group) {
        group.push(item);
      } else {
        lookup.set(key, [item]);
      }
    }
  }

  // First pass: Calculate total matches for pre-allocation
  let totalMatches = 0;
  const outerLen = this.length;
  const outerKeys = new Array<K>(outerLen);

  for (let i = 0; i < outerLen; i++) {
    if (i in this) {
      const key = outerKeySelector(this[i]);
      outerKeys[i] = key;
      const group = lookup.get(key);
      totalMatches += group ? group.length : 0;
    }
  }

  // Pre-allocate result array
  const result = new Array<V>(totalMatches);
  let resultIndex = 0;

  // Second pass: Fill pre-allocated array
  for (let i = 0; i < outerLen; i++) {
    if (i in this) {
      const outer = this[i];
      const key = outerKeys[i];
      const group = lookup.get(key);

      if (group) {
        const groupLen = group.length;
        // Process group in blocks of 8 for better ILP
        for (let j = 0; j < groupLen; j++) {
          result[resultIndex++] = resultSelector(outer, group[j]);
        }
      }
    }
  }

  return result;
};
Array.prototype.any = function <T>(
  this: T[],
  predicate?: (item: T) => boolean,
): boolean {
  return predicate ? this.some(predicate) : this.length > 0;
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
  if (predicate) {
    for (let i = 0; i < this.length; i++) {
      const item = this[i];
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  } else {
    return this.length > 0 ? this[0] : undefined;
  }
};

Array.prototype.last = function <T>(
  this: T[],
  predicate?: (item: T) => boolean,
): T | undefined {
  if (predicate) {
    for (let i = this.length - 1; i >= 0; i--) {
      const item = this[i];
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  } else {
    return this.length > 0 ? this[this.length - 1] : undefined;
  }
};

Array.prototype.distinct = function <T>(this: T[]): T[] {
  return [...new Set(this)];
};

Array.prototype.orderBy = function <T, R>(
  this: T[],
  selector: (item: T) => R
): T[] {
  return this
    .map((item, index) => ({ item, key: selector(item), index }))
    .sort((a, b) => {
      if (a.key < b.key) return -1;
      if (a.key > b.key) return 1;
      return a.index - b.index;
    })
    .map(e => e.item);
};

Array.prototype.orderByDescending = function <T, R>(
  this: T[],
  selector: (item: T) => R,
): T[] {
  return this
    .map((item, index) => ({ item, key: selector(item), index }))
    .sort((a, b) => {
      if (a.key < b.key) return 1;
      if (a.key > b.key) return -1;
      return a.index - b.index;
    })
    .map(e => e.item);
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
  const secondSet = new Set(secondArray);
  return this.filter((item) => !secondSet.has(item));
};

Array.prototype.union = function <T>(this: T[], secondArray: T[]): T[] {
  return [...new Set([...this, ...secondArray])];
};

Array.prototype.intersect = function <T>(this: T[], secondArray: T[]): T[] {
  const secondSet = new Set(secondArray);
  return this.filter((item) => secondSet.has(item));
};

Array.prototype.takeWhile = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
  let takeIndex = 0;
  while (takeIndex < this.length && predicate(this[takeIndex])) {
    takeIndex++;
  }
  return this.slice(0, takeIndex);
};

Array.prototype.skipWhile = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
  let skipIndex = 0;
  while (skipIndex < this.length && predicate(this[skipIndex])) {
    skipIndex++;
  }
  return this.slice(skipIndex);
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
    if (!predicate(this[i])) return false;
  }
  return true;
};

String.prototype.any = function (
  predicate?: (item: string) => boolean,
): boolean {
  return predicate
    ? Array.prototype.some.call(this, predicate)
    : this.length > 0;
};

String.prototype.contains = function (item: string): boolean {
  return this.includes(item);
};

String.prototype.groupBy = function <K>(
  keySelector: (item: string) => K,
): Map<K, string[]> {
  const map = new Map<K, string[]>();
  for (const char of this) {
    const key = keySelector(char);
    const group = map.get(key);
    if (group) group.push(char);
    else map.set(key, [char]);
  }
  return map;
};

String.prototype.distinct = function (): string {
  const seen = new Set<string>();
  const arr = [];
  for (const char of this) {
    if (!seen.has(char)) {
      seen.add(char);
      arr.push(char);
    }
  }
  return arr.join("");
};

String.prototype.except = function (secondString: string): string {
  const secondSet = new Set(secondString);
  const arr = [];
  for (const char of this) {
    if (!secondSet.has(char)) arr.push(char);
  }
  return arr.join("");
};

String.prototype.first = function (
  predicate?: (item: string) => boolean,
): string | undefined {
  return predicate
    ? Array.prototype.find.call(this, predicate)
    : this[0] || undefined;
};

String.prototype.intersect = function (secondString: string): string {
  const set = new Set(secondString);
  const arr = [];
  for (const char of this) {
    if (set.has(char)) arr.push(char);
  }
  return arr.join("");
};

String.prototype.orderBy = function <R>(selector: (item: string) => R): string {
  return Array.from(this)
    .sort((a, b) => {
      const sa = selector(a);
      const sb = selector(b);
      return sa > sb ? 1 : sa < sb ? -1 : 0;
    })
    .join("");
};

String.prototype.orderByDescending = function <R>(
  selector: (item: string) => R,
): string {
  return Array.from(this)
    .sort((a, b) => {
      const sa = selector(a);
      const sb = selector(b);
      return sa < sb ? 1 : sa > sb ? -1 : 0;
    })
    .join("");
};

String.prototype.select = function <R>(selector: (item: string) => R): string {
  const arr = [];
  for (const char of this) arr.push(selector(char));
  return arr.join("");
};

String.prototype.skip = function (count: number): string {
  return this.slice(count);
};

String.prototype.skipWhile = function (
  predicate: (item: string) => boolean,
): string {
  let index = 0;
  while (index < this.length && predicate(this[index])) index++;
  return this.slice(index);
};

String.prototype.take = function (count: number): string {
  return this.slice(0, count);
};

String.prototype.takeWhile = function (
  predicate: (item: string) => boolean,
): string {
  let index = 0;
  while (index < this.length && predicate(this[index])) index++;
  return this.slice(0, index);
};

String.prototype.toArray = function (): string[] {
  return Array.from(this);
};

String.prototype.union = function (secondString: string): string {
  const set = new Set(this);
  for (const char of secondString) set.add(char);
  return Array.from(set).join("");
};

String.prototype.where = function (
  predicate: (item: string) => boolean,
): string {
  const arr = [];
  for (const char of this) {
    if (predicate(char)) arr.push(char);
  }
  return arr.join("");
};
