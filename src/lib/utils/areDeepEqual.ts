export function areDeepEqual<T>(value1: T, value2: T): boolean {
  if (value1 === value2) {
    return true;
  }

  if (typeof value1 !== 'object' ||
    typeof value2 !== 'object' ||
    value1 === null ||
    value2 === null) {
    return false;
  }

  const isArray1 = Array.isArray(value1);
  if (isArray1 !== Array.isArray(value2)) {
    return false;
  }

  if (isArray1) {
    const arr1 = value1 as any[];
    const arr2 = value2 as any[];

    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (!areDeepEqual(arr1[i], arr2[i])) {
        return false;
      }
    }
    return true;
  }

  const obj1 = value1 as Record<string, any>;
  const obj2 = value2 as Record<string, any>;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!(key in obj2) || !areDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
