export function areDeepEqual<T>(value1: T, value2: T): boolean {
  const type1 = typeof value1;
  const type2 = typeof value2;

  if (type1 !== type2) {
    return false;
  }

  if (type1 !== 'object' || value1 === null || value2 === null) {
    return value1 === value2;
  }

  const isArray1 = Array.isArray(value1);
  const isArray2 = Array.isArray(value2);

  if (isArray1 !== isArray2) {
    return false;
  }

  if (isArray1 && Array.isArray(value1) && Array.isArray(value2)) {
    return (
      value1.length === value2.length &&
      value1.every((member1, i) => areDeepEqual(member1, value2[i]))
    );
  }

  const object1 = value1 as Record<string, unknown>;
  const object2 = value2 as Record<string, unknown>;

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key1 => areDeepEqual(object1[key1], object2[key1]));
}
