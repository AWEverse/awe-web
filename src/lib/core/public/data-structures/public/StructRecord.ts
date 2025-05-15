/**
 * Primitive types that can be used in a record
 */
type Primitive = null | boolean | number | string;

/**
 * Valid types that can be used as values in a record
 */
type ValidValue = Primitive | any[] | Record<string, any>;

/**
 * Interface defining the structure of a record constructor
 * @template T The type of the record
 */
interface RecordConstructor<T> {
  new(): T;
  fields: string[];
  defaults: T;
  mutable: boolean;
  create(data?: Partial<T>): Readonly<T>;
}

/**
 * A high-performance immutable record data structure with type safety and runtime validation.
 * Provides efficient ways to create and manipulate structured data with immutability guarantees.
 *
 * Features:
 * - Type-safe record creation with runtime validation
 * - Immutable and mutable record variants
 * - Efficient updates via prototypal inheritance
 * - Memory-efficient structure sharing
 *
 * @example
 * ```typescript
 * const Person = StructRecord.immutable({
 *   name: '',
 *   age: 0
 * });
 *
 * const person = Person.create({ name: 'John', age: 30 });
 * ```
 */
class StructRecord {
  /**
   * Creates an immutable record constructor with the specified default values.
   * @template T The record type
   * @param defaults The default values for the record
   * @returns A constructor for creating immutable records
   */
  static immutable<T extends Record<string, ValidValue>>(
    defaults: T,
  ): RecordConstructor<T> {
    return StructRecord.#build(defaults, false);
  }

  /**
   * Creates a mutable record constructor with the specified default values.
   * @template T The record type
   * @param defaults The default values for the record
   * @returns A constructor for creating mutable records
   */
  static mutable<T extends Record<string, ValidValue>>(
    defaults: T,
  ): RecordConstructor<T> {
    return StructRecord.#build(defaults, true);
  }

  /**
   * Internal method to build a record constructor.
   * @private
   */
  static #build<T extends Record<string, ValidValue>>(
    defaults: T,
    isMutable: boolean,
  ): RecordConstructor<T> {
    // Cache the fields array for better performance
    const fields = Object.freeze(Object.keys(defaults));
    // Create an immutable copy of defaults for safety
    const defaultValues = Object.freeze({ ...defaults });

    class Struct {
      static fields = fields;
      static defaults = defaultValues;
      static mutable = isMutable;

      static create(data: Partial<T> = {}): Readonly<T> {
        // Use null prototype for better performance and no inherited properties
        const obj = Object.create(null) as T;
        const dataKeys = new Set(Object.keys(data));

        // Optimize by checking data existence only once per field
        for (let i = 0; i < fields.length; i++) {
          const key = fields[i];
          const base = defaultValues[key];
          const hasValue = dataKeys.has(key);
          const value = hasValue && data[key] !== undefined ? data[key] : base;

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

  /**
   * Get the type of a value in a consistent way
   * @private
   */
  static #typeof(value: ValidValue): string {
    return Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  }

  /**
   * Check if two values have the same type
   * @private
   */
  static #sameType(a: ValidValue, b: ValidValue): boolean {
    return Array.isArray(a) ? Array.isArray(b) : a === null ? b === null : typeof a === typeof b;
  }

  /**
   * Update a mutable record instance with new values
   * @throws {Error} If the record is immutable
   * @throws {TypeError} If any update value has an invalid type
   */
  static update<T extends object>(instance: T, updates: Partial<T>): T {
    if (Object.isFrozen(instance)) {
      throw new Error("Cannot mutate immutable Record");
    }

    const updateKeys = Object.keys(updates) as Array<keyof T>;

    // Use for...of for better performance with early returns
    for (const key of updateKeys) {
      if (!Reflect.has(instance, key)) continue;

      const prev = instance[key];
      const next = updates[key]!;

      if (!StructRecord.#sameType(prev as ValidValue, next as ValidValue)) {
        const exp = StructRecord.#typeof(prev as ValidValue);
        const act = StructRecord.#typeof(next as ValidValue);
        throw new TypeError(
          `Invalid type for "${key as string}": expected ${exp}, got ${act}`,
        );
      }

      instance[key] = next;
    }

    return instance;
  }

  /**
   * Create a new record with updated values
   * @returns A new immutable record instance
   */
  static fork<T extends object>(instance: T, updates: Partial<T>): Readonly<T> {
    const obj = { ...instance } as T;
    const updateKeys = Object.keys(updates) as Array<keyof T>;

    for (const key of updateKeys) {
      if (!Reflect.has(instance, key)) continue;

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

    return Object.freeze(obj);
  }

  /**
   * Create a new record that inherits from the original instance
   * This is the most memory-efficient way to create a modified record
   * as it uses prototypal inheritance
   * @returns A new record instance with prototype inheritance
   */
  static branch<T extends object>(instance: T, updates: Partial<T>): T {
    const obj = Object.create(instance) as T;
    const updateKeys = Object.keys(updates) as Array<keyof T>;

    for (const key of updateKeys) {
      const next = updates[key]!;
      const prev = Reflect.get(instance, key);

      if (!StructRecord.#sameType(prev as ValidValue, next as ValidValue)) {
        const exp = StructRecord.#typeof(prev as ValidValue);
        const act = StructRecord.#typeof(next as ValidValue);
        throw new TypeError(
          `Invalid type for "${key as string}": expected ${exp}, got ${act}`,
        );
      }

      // Use Object.defineProperty for better performance than Reflect.defineProperty
      Object.defineProperty(obj, key, {
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
export type { RecordConstructor, Primitive, ValidValue };
