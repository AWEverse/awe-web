export function pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (result, key) => {
      result[key] = object[key];
      return result;
    },
    {} as Pick<T, K>,
  );
}

export function pickTruthy<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (result, key) => {
      if (object[key]) {
        result[key] = object[key];
      }
      return result;
    },
    {} as Pick<T, K>,
  );
}

export function omit<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
  const stringKeys = new Set(keys.map(String));
  const savedKeys = Object.keys(object).filter(key => !stringKeys.has(key)) as Array<Exclude<keyof T, K>>;

  return pick(object, savedKeys);
}

export function omitUndefined<T extends object>(object: T): T {
  return Object.keys(object).reduce((result, stringKey) => {
    const key = stringKey as keyof T;
    if (object[key] !== undefined) {
      result[key as keyof T] = object[key];
    }
    return result;
  }, {} as T);
}
