/* eslint-disable @typescript-eslint/no-explicit-any */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function uniqueByField<T>(array: T[], field: keyof T): T[] {
  return [...new Map(array.map(item => [item[field], item])).values()];
}

export function compact<T>(array: T[]) {
  return array.filter(Boolean);
}

export function chunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}

export function partition<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  array.forEach((e, idx, arr) => (predicate(e, idx, arr) ? pass : fail).push(e));
  return [pass, fail];
}

export function areSortedArraysEqual(array1: any[], array2: any[]) {
  if (array1.length !== array2.length) {
    return false;
  }

  return array1.every((item, i) => item === array2[i]);
}

export function mergeArrays<T>(array1: T[], array2: T[]): T[] {
  return [...array1, ...array2];
}

export function mergeArraysUnique<T>(array1: T[], array2: T[]): T[] {
  return Array.from(new Set([...array1, ...array2]));
}

export function mergeArraysUniqueByField<T>(array1: T[], array2: T[], field: keyof T): T[] {
  const uniqueMap = new Map<T[keyof T], T>();

  for (const item of [...array1, ...array2]) {
    uniqueMap.set(item[field], item);
  }

  return Array.from(uniqueMap.values());
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

export function flattenUnique<T>(array: T[][]): T[] {
  return Array.from(new Set(flatten(array)));
}

export function flattenUniqueByField<T>(array: T[][], field: keyof T): T[] {
  return uniqueByField(flatten(array), field);
}
