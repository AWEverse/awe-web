type Turple<T extends AnyArray> = [...T];

/**
 * A utility class for creating fixed-size, immutable tuples with type-safe arity.
 * @public
 */
class Tuple {
  /**
   * Creates a tuple constructor with a fixed arity based on the provided values.
   * @template T - The tuple type array
   * @param values - Values defining the tuple's arity and types
   * @returns A tuple constructor for creating immutable tuples of the specified size and types
   * @example
   * const Pair = Tuple.create(1, "two");
   * const pair = Pair.create(3, "four"); // Creates [3, "four"] with proper types
   */
  static create<T extends readonly unknown[]>(...values: T) {
    const arity = values.length;

    class TupleStruct {
      /** The fixed size (arity) of the tuple. */
      static readonly size: number = arity;

      /**
       * Creates an immutable tuple with the specified items.
       * @template U - The tuple element types
       * @param items - Values to include in the tuple
       * @returns A frozen array representing the tuple with proper type inference
       * @throws {RangeError} If the number of items does not match the tuple's arity
       * @example
       * const Triple = Tuple.create(0, "", false);
       * const triple = Triple.create(1, "test", true); // Creates [1, "test", true] with types [number, string, boolean]
       */
      static create<U extends { [K in keyof T]: unknown }>(...items: U): Readonly<U> {
        if (items.length !== arity) {
          throw new RangeError(`Expected ${arity} items, got ${items.length}`);
        }
        return Object.freeze(items) as Readonly<U>;
      }

      /**
       * Returns the expected arity of the tuple.
       * @returns The number of elements expected in the tuple
       */
      static getArity(): number {
        return arity;
      }
    }

    return TupleStruct;
  }
}
