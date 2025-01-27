Array.prototype.select = function <T, S>(
  this: T[],
  selector: (item: T) => S,
): S[] {
  if (typeof selector !== "function")
    throw new TypeError("Selector must be a function");

  const length = this.length;
  const result = new Array<S>(length);

  for (let i = 0; i < length; i++) {
    if (i in this) {
      // Handle sparse arrays
      result[i] = selector(this[i]);
    }
  }

  return result;
};

Array.prototype.where = function <T>(
  this: T[],
  predicate: (item: T) => boolean,
): T[] {
  if (typeof predicate !== "function")
    throw new TypeError("Predicate must be a function");

  const length = this.length;
  const result: T[] = [];
  result.length = length; // Pre-allocate memory

  let count = 0;
  for (let i = 0; i < length; i++) {
    if (i in this && predicate(this[i])) {
      result[count++] = this[i];
    }
  }

  result.length = count; // Truncate to actual size
  return result;
};

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
  const sourceLength = source.length;
  let totalLength = 0;

  const nestedArrays: U[][] = [];
  for (let i = 0; i < sourceLength; i++) {
    if (i in source) {
      const nested = selector(source[i]);
      nestedArrays[i] = nested;
      totalLength += nested.length;
    }
  }

  const result = new Array<U>(totalLength);
  let resultIndex = 0;

  for (let i = 0; i < sourceLength; i++) {
    if (i in source) {
      const nested = nestedArrays[i];
      const nestedLength = nested.length;

      for (let j = 0; j < nestedLength; j++) {
        result[resultIndex + j] = nested[j];
      }

      resultIndex += nestedLength;
    }
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
  selector: (item: T) => R,
): T[] {
  const MIN_MERGE = 32;

  // Precompute keys to avoid repeated selector calls
  const mappedArray = this.map((item) => ({
    key: selector(item),
    item,
  }));

  const minRunLength = (n: number): number => {
    let r = 0;
    while (n >= MIN_MERGE) {
      r |= n & 1;
      n >>= 1;
    }
    return n + r;
  };

  const insertionSort = (
    arr: typeof mappedArray,
    left: number,
    right: number,
  ): void => {
    for (let i = left + 1; i <= right; i++) {
      const temp = arr[i];
      let j = i - 1;
      // Compare precomputed keys
      while (j >= left && arr[j].key > temp.key) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = temp;
    }
  };

  const merge = (
    arr: typeof mappedArray,
    l: number,
    m: number,
    r: number,
  ): void => {
    const len1 = m - l + 1;
    const len2 = r - m;
    const [left, right] = [new Array(len1), new Array(len2)];

    for (let x = 0; x < len1; x++) left[x] = arr[l + x];
    for (let x = 0; x < len2; x++) right[x] = arr[m + 1 + x];

    let [i, j, k] = [0, 0, l];
    while (i < len1 && j < len2) {
      arr[k++] = left[i].key <= right[j].key ? left[i++] : right[j++];
    }
    while (i < len1) arr[k++] = left[i++];
    while (j < len2) arr[k++] = right[j++];
  };

  const timSort = (arr: typeof mappedArray, n: number): void => {
    const minRun = minRunLength(MIN_MERGE);
    // Initial insertion sort on small runs
    for (let i = 0; i < n; i += minRun) {
      insertionSort(arr, i, Math.min(i + minRun - 1, n - 1));
    }
    // Progressive merging
    for (let size = minRun; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);
        if (mid < right) merge(arr, left, mid, right);
      }
    }
  };

  timSort(mappedArray, mappedArray.length);
  return mappedArray.map((e) => e.item);
};

Array.prototype.orderByDescending = function <T, R>(
  this: T[],
  selector: (item: T) => R,
): T[] {
  const MIN_MERGE = 32;

  // Precompute keys once to avoid redundant selector calls
  const mappedArray = this.map((item) => ({
    key: selector(item),
    item,
  }));

  const minRunLength = (n: number): number => {
    let r = 0;
    while (n >= MIN_MERGE) {
      r |= n & 1;
      n >>= 1;
    }
    return n + r;
  };

  const insertionSort = (
    arr: typeof mappedArray,
    left: number,
    right: number,
  ): void => {
    for (let i = left + 1; i <= right; i++) {
      const temp = arr[i];
      let j = i - 1;
      // Changed comparison to descending order
      while (j >= left && arr[j].key < temp.key) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = temp;
    }
  };

  const merge = (
    arr: typeof mappedArray,
    l: number,
    m: number,
    r: number,
  ): void => {
    const len1 = m - l + 1;
    const len2 = r - m;
    const [leftArr, rightArr] = [new Array(len1), new Array(len2)];

    for (let x = 0; x < len1; x++) leftArr[x] = arr[l + x];
    for (let x = 0; x < len2; x++) rightArr[x] = arr[m + 1 + x];

    let [i, j, k] = [0, 0, l];
    while (i < len1 && j < len2) {
      // Reverse comparison for descending order
      arr[k++] =
        leftArr[i].key >= rightArr[j].key ? leftArr[i++] : rightArr[j++];
    }
    while (i < len1) arr[k++] = leftArr[i++];
    while (j < len2) arr[k++] = rightArr[j++];
  };

  const timSort = (arr: typeof mappedArray, n: number): void => {
    const minRun = minRunLength(MIN_MERGE);
    for (let i = 0; i < n; i += minRun) {
      insertionSort(arr, i, Math.min(i + minRun - 1, n - 1));
    }
    for (let size = minRun; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);
        if (mid < right) merge(arr, left, mid, right);
      }
    }
  };

  timSort(mappedArray, mappedArray.length);
  return mappedArray.map((e) => e.item);
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
