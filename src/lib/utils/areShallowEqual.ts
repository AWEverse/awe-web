export type validArrayValue = any[] | null | undefined;
export type validObjectValue = Record<string, any> | null | undefined;
type Comparable = Record<string, any> | any[] | null | undefined;

function shallowEqualArrays(
  arrA: validArrayValue,
  arrB: validArrayValue,
): boolean {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  const len = arrA.length;
  let halfLen = Math.floor(len / 2);

  for (let i = 0; i < halfLen; i++) {
    if (arrA[i] !== arrB[i] && arrA[len - i - 1] !== arrB[len - i - 1]) {
      return false;
    }
  }

  if (len % 2 === 1 && arrA[halfLen] !== arrB[halfLen]) {
    return false;
  }

  return true;
}

function shallowEqualObjects(
  objA: validObjectValue,
  objB: validObjectValue,
): boolean {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (
      objA[key] !== objB[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}

export default function areShallowEqual<T extends Comparable>(
  a: T,
  b: T,
): boolean {
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  if (aIsArr !== bIsArr) {
    return false;
  }

  if (aIsArr && bIsArr) {
    return shallowEqualArrays(a, b);
  }

  return shallowEqualObjects(a, b);
}

export { shallowEqualObjects, shallowEqualArrays };
