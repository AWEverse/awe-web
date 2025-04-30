/**
 * A utility class for creating fixed-size, immutable tuples with type-safe arity.
 * @public
 */
class Tuple {
  /**
   * Creates a tuple constructor with a fixed arity based on the provided values.
   * @param values - Values defining the tuple's arity.
   * @returns A tuple constructor for creating immutable tuples of the specified size.
   * @example
   * const Pair = Tuple.create(1, "two");
   * const pair = Pair.create(3, "four"); // Creates [3, "four"]
   */
  static create(...values: unknown[]) {
    const arity = values.length;

    class Struct {
      /** The fixed size (arity) of the tuple. */
      static readonly size: number = arity;

      /**
       * Creates an immutable tuple with the specified items.
       * @param items - Values to include in the tuple.
       * @returns A frozen array representing the tuple.
       * @throws {RangeError} If the number of items does not match the tuple's arity.
       * @example
       * const Triple = Tuple.create(0, "", false);
       * const triple = Triple.create(1, "test", true); // Creates [1, "test", true]
       */
      static create(...items: unknown[]): ReadonlyArray<unknown> {
        if (items.length !== arity) {
          throw new RangeError(`Expected ${arity} items, got ${items.length}`);
        }
        return Object.freeze(items);
      }
    }

    return Struct;
  }
}
