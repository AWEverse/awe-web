export function areDeepEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }

  const typeA = typeof a;
  if (typeA !== typeof b) {
    return false;
  }

  if (typeA !== "object" || a === null || b === null) {
    return a === b;
  }

  const isArrayA = Array.isArray(a);
  if (isArrayA !== Array.isArray(b)) {
    return false;
  }

  const stack: {
    a: unknown;
    b: unknown;
    isArray: boolean;
    keysOrLength: number | string[];
    index: number;
  }[] = [];

  let stackSize = 0;

  if (isArrayA) {
    if ((a as T[]).length !== (b as T[]).length) {
      return false;
    }
  } else {
    if (Object.keys(a as object).length !== Object.keys(b as object).length) {
      return false;
    }
  }

  stack[stackSize++] = {
    a,
    b,
    isArray: isArrayA,
    keysOrLength: isArrayA ? (a as T[]).length : Object.keys(a as object),
    index: 0,
  };

  while (stackSize > 0) {
    const item = stack[stackSize - 1];
    const { isArray, keysOrLength, index } = item;

    const limit = isArray
      ? (keysOrLength as number)
      : (keysOrLength as string[]).length;

    if (index >= limit) {
      stackSize--;
      continue;
    }

    let valA: unknown, valB: unknown, key: string | number;
    if (isArray) {
      const arrA = item.a as T[];
      const arrB = item.b as T[];
      key = index;

      valA = arrA[index];
      valB = arrB[index];
    } else {
      const objA = item.a as Record<string, T>;
      const objB = item.b as Record<string, T>;
      const keys = keysOrLength as string[];
      key = keys[index];

      if (!(key in objB)) {
        return false;
      }

      valA = objA[key];
      valB = objB[key];
    }

    if (valA === valB) {
      item.index++;
      continue;
    }

    const typeValA = typeof valA;
    if (typeValA !== typeof valB) {
      return false;
    }

    if (typeValA !== "object" || valA === null || valB === null) {
      if (valA !== valB) {
        return false;
      }
      item.index++;
      continue;
    }

    const isNestedArrayA = Array.isArray(valA);
    if (isNestedArrayA !== Array.isArray(valB)) {
      return false;
    }

    if (isNestedArrayA) {
      if ((valA as T[]).length !== (valB as T[]).length) {
        return false;
      }
    } else {
      if (
        Object.keys(valA as object).length !==
        Object.keys(valB as object).length
      ) {
        return false;
      }
    }

    stack[stackSize++] = {
      a: valA,
      b: valB,
      isArray: isNestedArrayA,
      keysOrLength: isNestedArrayA
        ? (valA as T[]).length
        : Object.keys(valA as object),
      index: 0,
    };
  }

  stack.length = 0;
  return true;
}
