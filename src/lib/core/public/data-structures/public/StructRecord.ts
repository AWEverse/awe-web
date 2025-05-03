type Primitive = null | boolean | number | string;
type ValidValue = Primitive | any[] | Record<string, any>;

interface RecordConstructor<T> {
  new(): T;
  fields: string[];
  defaults: T;
  mutable: boolean;
  create(data?: Partial<T>): Readonly<T>;
}

class StructRecord {
  static immutable<T extends Record<string, ValidValue>>(
    defaults: T,
  ): RecordConstructor<T> {
    return StructRecord.#build(defaults, false);
  }

  static mutable<T extends Record<string, ValidValue>>(
    defaults: T,
  ): RecordConstructor<T> {
    return StructRecord.#build(defaults, true);
  }

  static #build<T extends Record<string, ValidValue>>(
    defaults: T,
    isMutable: boolean,
  ): RecordConstructor<T> {
    const fields = Object.keys(defaults);
    const defaultValues = { ...defaults };

    class Struct {
      static fields = fields;
      static defaults = defaultValues;
      static mutable = isMutable;

      static create(data: Partial<T> = {}): Readonly<T> {
        const obj = Object.create(null) as T;

        for (const key of fields) {
          const base = defaultValues[key];
          const value =
            key in data && data[key] !== undefined ? data[key] : base;

          if (!StructRecord.#sameType(base, value)) {
            const exp = StructRecord.#typeof(base);
            const act = StructRecord.#typeof(value);
            throw new TypeError(
              `Invalid type for "${key}": expected ${exp}, got ${act}`,
            );
          }

          obj[key as keyof T] = value as T[keyof T];
        }

        return (isMutable ? Object.seal : Object.freeze)(obj);
      }
    }

    return Struct as unknown as RecordConstructor<T>;
  }

  static #typeof(value: ValidValue): string {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
  }

  static #sameType(a: ValidValue, b: ValidValue): boolean {
    if (Array.isArray(a)) return Array.isArray(b);
    if (a === null) return b === null;
    return typeof a === typeof b;
  }

  static update<T extends object>(instance: T, updates: Partial<T>): T {
    if (Object.isFrozen(instance)) {
      throw new Error("Cannot mutate immutable Record");
    }

    const keys = Object.keys(updates) as Array<keyof T>;

    for (const key of keys) {
      if (Reflect.has(instance, key)) {
        const prev = instance[key];
        const next = updates[key]!;

        if (!StructRecord.#sameType(prev as ValidValue, next as ValidValue)) {
          const exp = StructRecord.#typeof(prev as ValidValue);
          const act = StructRecord.#typeof(next as ValidValue);

          throw new TypeError(
            `Invalid type for "${key as string}": expected ${exp}, got ${act}`,
          );
        }

        instance[key] = next; // mutate the initial obj
      }
    }

    return instance;
  }

  static fork<T extends object>(instance: T, updates: Partial<T>): Readonly<T> {
    const obj = { ...instance } as T; // Create a copy
    const keys = Object.keys(updates) as Array<keyof T>;

    for (const key of keys) {
      if (Reflect.has(instance, key)) {
        const prev = obj[key];
        const next = updates[key]!;

        if (!StructRecord.#sameType(prev as ValidValue, next as ValidValue)) {
          const exp = StructRecord.#typeof(prev as ValidValue);
          const act = StructRecord.#typeof(next as ValidValue);

          throw new TypeError(
            `Invalid type for "${key as string}": expected ${exp}, got ${act}`,
          );
        }

        obj[key] = next;
      }
    }

    return Object.freeze(obj);
  }

  static branch<T extends object>(instance: T, updates: Partial<T>): T {
    const obj = Object.create(instance) as T;
    const keys = Object.keys(updates) as Array<keyof T>;

    for (const key of keys) {
      const next = updates[key]!;
      const prev = Reflect.get(instance, key);

      if (!StructRecord.#sameType(prev as ValidValue, next as ValidValue)) {
        const exp = StructRecord.#typeof(prev as ValidValue);
        const act = StructRecord.#typeof(next as ValidValue);

        throw new TypeError(
          `Invalid type for "${key as string}": expected ${exp}, got ${act}`,
        );
      }

      Reflect.defineProperty(obj, key, {
        value: next,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    return (Object.isFrozen(instance) ? Object.freeze : Object.seal)(obj);
  }
}

export default StructRecord;
export type { RecordConstructor };
