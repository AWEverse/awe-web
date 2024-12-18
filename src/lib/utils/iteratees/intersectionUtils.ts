export function findIntersectionWithSet<T>(array: T[], set: Set<T>): T[] {
  return array.filter(a => set.has(a));
}

export function excludeSortedArray<T>(base: T[], toExclude: T[]): T[] {
  if (!base?.length) return base;
  const result: T[] = [];
  let excludeIndex = 0;

  for (let i = 0; i < base.length; i++) {
    if (toExclude[excludeIndex] === base[i]) {
      excludeIndex += 1;
    } else {
      result.push(base[i]);
    }
  }
  return result;
}
