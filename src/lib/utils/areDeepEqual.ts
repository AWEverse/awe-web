export function areDeepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  const ta = typeof a;
  if (ta !== typeof b) return false;

  if (ta !== 'object' || !a || !b) return a === b;

  const isArrA = a instanceof Array;
  if (isArrA !== (b instanceof Array)) return false;

  if (isArrA) {
    const arrA = a as unknown[], arrB = b as unknown[];
    const len = arrA.length;
    if (len !== arrB.length) return false;

    for (let i = 0; i < len; i++) {
      if (!areDeepEqual(arrA[i], arrB[i])) return false;
    }
    return true;
  }

  const objA = a as Record<string, any>;
  const objB = b as Record<string, any>;
  const keys = Object.keys(objA);

  if (keys.length !== Object.keys(objB).length) return false;

  for (let i = 0, len = keys.length; i < len; ++i) {
    const k = keys[i];

    if (!(k in objB) || !areDeepEqual(objA[k], objB[k])) return false;
  }
  return true;
}
