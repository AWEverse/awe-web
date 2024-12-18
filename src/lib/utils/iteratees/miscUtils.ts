/* eslint-disable @typescript-eslint/no-explicit-any */
export function cloneDeep<T>(value: T): T {
  if (!isObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(cloneDeep) as typeof value;
  }

  return Object.keys(value).reduce((acc, key) => {
    acc[key as keyof T] = cloneDeep(value[key as keyof T]);
    return acc;
  }, {} as T);
}

export function isLiteralObject(value: any): value is AnyLiteral {
  return isObject(value) && !Array.isArray(value);
}

function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}

export function findLast<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
  let cursor = array.length;
  while (cursor--) {
    if (predicate(array[cursor], cursor, array)) {
      return array[cursor];
    }
  }
  return undefined;
}
