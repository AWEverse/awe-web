type RecordFields = readonly string[];

type RecordInstance<T extends RecordFields> = {
  readonly [K in T[number]]: unknown;
};

interface RecordStruct<T extends RecordFields> {
  readonly fields: T;
  readonly mutable: boolean;
  create(...args: unknown[]): RecordInstance<T>;
}

/**
 * A utility class for creating typed immutable/mutable record constructors.
 * @public
 */
class ORecord {
  /**
   * Creates a factory for immutable records with the given schema.
   * @param schema - The schema defining the record's fields and default values.
   * @returns A record struct for creating immutable record instances.
   * @example
   * const Person = ORecord.immutable({ name: "", age: 0 });
   * const person = Person.create({ name: "Alice", age: 30 });
   */
  static immutable<TSchema extends Record<string, unknown>>(schema: TSchema): RecordStruct<readonly string[]> {
    return this.#build(schema, false);
  }

  /**
   * Creates a factory for mutable records with the given schema.
   * @param schema - The schema defining the record's fields and default values.
   * @returns A record struct for creating mutable record instances.
   * @example
   * const Person = ORecord.mutable({ name: "", age: 0 });
   * const person = Person.create({ name: "Bob", age: 25 });
   */
  static mutable<TSchema extends Record<string, unknown>>(schema: TSchema): RecordStruct<readonly string[]> {
    return this.#build(schema, true);
  }

  /**
   * Internal builder that generates a record class based on the schema and mutability.
   * @param schema - The schema defining the record's fields and default values.
   * @param isMutable - Whether the record is mutable.
   * @returns A record struct for creating record instances.
   * @private
   */
  static #build<TSchema extends Record<string, unknown>>(
    schema: TSchema,
    isMutable: boolean
  ): RecordStruct<readonly string[]> {
    const fieldNames = Object.keys(schema) as readonly string[];
    const fieldCount = fieldNames.length;

    class Struct {
      [key: string]: unknown;
      /** The fields defined in the schema. */
      static readonly fields = fieldNames;
      /** Whether the record is mutable. */
      static readonly mutable = isMutable;

      /**
       * Creates a new record instance with the provided arguments.
       * @param args - Values for the record's fields.
       * @throws {RangeError} If the number of arguments does not match the schema's field count.
       */
      constructor(...args: unknown[]) {
        if (args.length !== fieldCount) {
          throw new RangeError(`Expected ${fieldCount} arguments, got ${args.length}`);
        }

        for (let i = 0; i < fieldCount; i++) {
          Object.defineProperty(this, fieldNames[i], {
            value: args[i] ?? schema[fieldNames[i]], // Use schema default if undefined
            writable: isMutable,
            enumerable: true,
            configurable: isMutable
          });
        }

        isMutable ? Object.seal(this) : Object.freeze(this);
      }

      /**
       * Creates a new record instance from an object or argument list.
       * @param args - Either an object with field values or a list of field values.
       * @returns A new record instance.
       * @example
       * const record = Struct.create({ field1: "value1", field2: 42 });
       * const record2 = Struct.create("value1", 42);
       */
      static create(...args: unknown[]): RecordInstance<typeof fieldNames> {
        if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
          const data = args[0] as Record<string, unknown>;
          return new Struct(...fieldNames.map(key => data[key]));
        }
        return new Struct(...args);
      }
    }

    return Struct as RecordStruct<typeof fieldNames>;
  }

  /**
   * Safely updates a mutable record instance with new values.
   * @param instance - The mutable record instance to update.
   * @param updates - An object containing the fields to update.
   * @throws {TypeError} If the instance is immutable or not a sealed record.
   * @example
   * const Person = ORecord.mutable({ name: "", age: 0 });
   * const person = Person.create({ name: "Bob", age: 25 });
   * ORecord.update(person, { age: 26 });
   */
  static update<TFields extends Record<string, unknown>>(instance: TFields, updates: Partial<TFields>): void {
    if (Object.isFrozen(instance) || !Object.isSealed(instance)) {
      throw new TypeError("Can only update mutable, sealed records.");
    }

    const keys = Object.keys(updates);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (key in instance) {
        (instance as any)[key] = updates[key];
      }
    }
  }

  /**
   * Creates a new record instance with applied updates, preserving mutability.
   * @param instance - The record instance to fork.
   * @param updates - An object containing the fields to update.
   * @returns A new record instance with the updates applied.
   * @example
   * const Person = ORecord.immutable({ name: "", age: 0 });
   * const person = Person.create({ name: "Alice", age: 30 });
   * const updated = ORecord.fork(person, { age: 31 });
   */
  static fork<TFields extends Record<string, unknown>>(instance: TFields, updates: Partial<TFields>): TFields {
    const clone = Object.create(Object.getPrototypeOf(instance));
    const keys = Object.keys(instance);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      clone[key] = key in updates ? updates[key] : instance[key];
    }

    return (Object.isFrozen(instance) ? Object.freeze : Object.seal)(clone);
  }
}
