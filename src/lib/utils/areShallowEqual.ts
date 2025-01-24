function is<T>(x: T, y: T): boolean {
  if (x !== x && y !== y) {
    return true;
  }

  if (x === y) {
    return (
      x !== 0 ||
      (typeof x === "number" && typeof y === "number" && 1 / x === 1 / y)
    );
  }

  return false;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default function areShallowEqual<T extends Record<string, any>>(
  objA: T,
  objB: T,
): boolean {
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];

    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}
