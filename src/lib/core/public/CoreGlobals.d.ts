/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a partial version of a given type where all properties are optional.
 * @template T - The type to make partial.
 */
type Partial<T> = { [K in keyof T]?: T[K] };

/**
 * Creates a version of a given type where all properties are `undefined`.
 * @template T - The type to convert to undefined.
 */
type Undefined<T> = { [K in keyof T]: undefined };

/**
 * Represents types that are considered "falsy".
 */
type Falsy = false | 0 | '' | null | undefined;

/**
 * Custom constructor interface for `Boolean`, ensuring proper type inference for `Falsy` values.
 */
interface BooleanConstructor {
  new <T>(value: T | Falsy): value is T;
  <T>(value: T | Falsy): value is T;
  readonly prototype: boolean;
}

/**
 * A custom implementation of the `Boolean` constructor, ensuring that it works similarly to `!!value`.
 * @param value - The value to coerce into a boolean.
 * @returns A boolean indicating the truthiness of the value.
 */
const Boolean: BooleanConstructor = (value: any) => !!value;

/**
 * Extends the HTMLElement interface to include cross-browser fullscreen support methods.
 */
interface HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
}

interface Document {
  mozCancelFullScreen?: () => Promise<void>;
  webkitCancelFullScreen: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
}

/**
 * Represents the union of two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Union<A, B> = A & B;

/**
 * Represents the intersection of two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Intersection<A, B> = A extends B ? A : never;

/**
 * Represents the difference between two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Difference<A, B> = A extends B ? never : A;

/**
 * Represents the symmetric difference between two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type SymmetricDifference<A, B> = Difference<A, B> | Difference<B, A>;

/**
 * Represents the complement of two types.
 * @template A - The first type.
 * @template B - The second type which extends A.
 */
type Complement<A, B extends A> = Difference<B, A>;

/**
 * Combines two types where optional fields from both are combined.
 * @template A - The first type.
 * @template B - The second type.
 */
type OptionalCombine<A, B> = Intersection<A, B> | Intersection<A | Undefined<B>>;

/**
 * Extracts the element type from a readonly array.
 * @template T - The array type.
 */
type ElementType<T> = T extends ReadonlyArray<infer E> ? E : never;

/**
 * Recursively extracts the elements of a nested array type.
 * @template T - The array type.
 * @template R - An accumulator array type (defaults to an empty array).
 */
type ElementsOfAll<T, R extends ReadonlyArray<unknown> = []> = T extends readonly [
  infer F,
  ...infer M,
]
  ? ElementsOfAll<M, [...R, ElementType<F>]>
  : R;

/**
 * Represents the cartesian product of elements from an array type.
 * @template T - The array type.
 */
type CartesianProduct<T> = ElementsOfAll<T>[];

/**
 * Represents the powerset of a given type, where each property is an array.
 * @template T - The base type.
 */
type PowerSet<T> = {
  [K in keyof T]?: T[K][];
};

/**
 * Represents the common properties between two types.
 * @template T - The first type.
 * @template U - The second type.
 */
type CommonProperties<T, U> = {
  [K in keyof T & keyof U]: T[K] | U[K];
};

type AnyToVoidFunction = (...args: any) => void;

/**
 * A function type that takes no arguments and returns `void`.
 */
type NoneToVoidFunction = () => void;

/**
 * A function type that takes no arguments and returns `any`.
 */
type NoneToAnyFunction = () => any;

/**
 * A function type that takes an unknown number of arguments and returns `unknown`.
 */
type UnknownFunction = (...args: unknown[]) => unknown;

/**
 * Represents a fuzzy set, where each element has a membership degree.
 * @template T - The type of elements in the fuzzy set.
 */
type FuzzySet<T> = { element: T; membershipDegree: number }[];

/**
 * Represents a graph vertex type.
 */
type Vertex = string | number;

/**
 * Represents an edge in a graph, defined as a pair of vertices.
 * @template T - The vertex type (defaults to `Vertex`).
 */
type Edge<T extends Vertex = Vertex> = [T, T];

/**
 * Represents an adjacency list in a graph, mapping vertices to their neighbors.
 * @template T - The vertex type (defaults to `Vertex`).
 */
type AdjacencyList<T extends Vertex = Vertex> = Map<T, T[]>;

/**
 * Represents a graph data structure.
 * @template T - The vertex type (defaults to `Vertex`).
 */
interface Graph<T extends Vertex = Vertex> {
  vertices: Set<T>;
  edges: Set<Edge<T>>;
  adjacencyList: AdjacencyList<T>;
}

/**
 * Array extensions for common functional programming operations.
 */
/**
 * Extends the `Array` prototype with custom utility methods.
 */
interface Array<T> {
  /**
   * Aggregates the elements in the array using a provided accumulator function.
   * @param seed The initial value to start the aggregation.
   * @param func The function to apply to each element, returning a new accumulator value.
   * @returns The final accumulated value.
   */
  aggregate<S>(seed: S, func: (acc: S, item: T) => S): S;

  /**
   * Determines whether all elements in the array satisfy a given predicate.
   * @param predicate The function to test each element.
   * @returns `true` if all elements satisfy the predicate, otherwise `false`.
   */
  all(predicate: (item: T) => boolean): boolean;

  /**
   * Determines whether any elements in the array satisfy a given predicate.
   * @param predicate The function to test each element. If omitted, returns `true` if the array is non-empty.
   * @returns `true` if any element satisfies the predicate, otherwise `false`.
   */
  any(predicate?: (item: T) => boolean): boolean;

  /**
   * Checks if the array contains a specific item.
   * @param item The item to search for in the array.
   * @returns `true` if the array contains the item, otherwise `false`.
   */
  contains(item: T): boolean;

  /**
   * Groups the elements of the array by a given selector.
   * @param selector A function to select the key for each element.
   * @returns A `Map` where keys are selected by the `selector` and values are arrays of matching elements.
   */
  groupBy<K>(keySelector: (item: T) => K): Map<K, T[]>;

  /**
   * Filters out duplicates from the array.
   * @returns A new array with distinct elements.
   */
  distinct(): T[];

  /**
   * Computes the difference between two arrays (elements in the current array not in the second array).
   * @param secondArray The array to compare against.
   * @returns An array containing the elements that are in the current array but not in the second array.
   */
  except(secondArray: T[]): T[];

  /**
   * Finds the first element that satisfies the provided predicate.
   * @param predicate The function to test each element. If omitted, returns the first element.
   * @returns The first element that satisfies the predicate or `undefined` if no match is found.
   */
  first(predicate?: (item: T) => boolean): T | undefined;

  /**
   * Computes the intersection between two arrays (common elements).
   * @param secondArray The array to compare against.
   * @returns An array containing the common elements between the two arrays.
   */
  intersect(secondArray: T[]): T[];

  /**
   * Performs an inner join between the array and another array based on a key selector.
   * @param innerArray The array to join with.
   * @param outerKeySelector A function to select the key for each element in the outer array.
   * @param innerKeySelector A function to select the key for each element in the inner array.
   * @param resultSelector A function to create the result from matching elements.
   * @returns An array of the result of the join.
   */
  joins<U, K, V>(
    innerArray: U[],
    outerKeySelector: (outer: T) => K,
    innerKeySelector: (inner: U) => K,
    resultSelector: (outer: T, inner: U) => V,
  ): V[];

  /**
   * Finds the last element that satisfies the provided predicate.
   * @param predicate The function to test each element. If omitted, returns the last element.
   * @returns The last element that satisfies the predicate or `undefined` if no match is found.
   */
  last(predicate?: (item: T) => boolean): T | undefined;

  /**
   * Orders the elements in the array based on a given selector in ascending order.
   * @param selector A function to extract a key to order the elements by.
   * @returns A new array with elements ordered in ascending order based on the selector.
   */
  orderBy(selector: (item: T) => any): T[];

  /**
   * Orders the elements in the array based on a given selector in descending order.
   * @param selector A function to extract a key to order the elements by.
   * @returns A new array with elements ordered in descending order based on the selector.
   */
  orderByDescending(selector: (item: T) => any): T[];

  /**
   * Projects each element of the array into a new form.
   * @param selector A function to select the new form of each element.
   * @returns A new array with the transformed elements.
   */
  select<S>(selector: (item: T) => S): S[];

  /**
   * Projects each element of the array into a new array and flattens the result.
   * @param selector A function to select an array from each element.
   * @returns A new array with all the selected arrays flattened.
   */
  selectMany<U>(selector: (item: T) => U[]): U[];

  /**
   * Skips the first `n` elements of the array.
   * @param count The number of elements to skip.
   * @returns A new array with the remaining elements after skipping `count` elements.
   */
  skip(count: number): T[];

  /**
   * Skips elements of the array as long as they satisfy a given predicate.
   * @param predicate A function to test each element. Skips elements that satisfy the predicate.
   * @returns A new array with elements after skipping those that satisfy the predicate.
   */
  skipWhile(predicate: (item: T) => boolean): T[];

  /**
   * Computes the sum of the elements in the array based on a selector.
   * @param selector A function to select the number to sum for each element. If omitted, sums the values of the elements themselves.
   * @returns The sum of the elements.
   */
  sum(selector?: (item: T) => number): number;

  /**
   * Takes the first `n` elements from the array.
   * @param count The number of elements to take.
   * @returns A new array containing the first `count` elements.
   */
  take(count: number): T[];

  /**
   * Takes elements from the array as long as they satisfy a given predicate.
   * @param predicate A function to test each element. Takes elements that satisfy the predicate.
   * @returns A new array with elements taken from the start until the predicate no longer satisfies.
   */
  takeWhile(predicate: (item: T) => boolean): T[];

  /**
   * Converts the array to a plain JavaScript array (same as using `Array.from`).
   * @returns A new array with the same elements.
   */
  toArray(): T[];

  /**
   * Computes the union of two arrays (elements that are in either array, without duplicates).
   * @param secondArray The array to compute the union with.
   * @returns An array containing all elements from both arrays, excluding duplicates.
   */
  union(secondArray: T[]): T[];

  /**
   * Filters the array based on a predicate function.
   * @param predicate A function to test each element.
   * @returns A new array with elements that satisfy the predicate.
   */
  where(predicate: (item: T) => boolean): Array<T>;

  /**
   * Combines elements from two arrays based on a selector.
   * @param secondArray The second array to combine with.
   * @param resultSelector A function to create the result from each pair of elements.
   * @returns A new array containing the results of combining elements from both arrays.
   */
  zip<U, V>(secondArray: U[], resultSelector: (first: T, second: U) => V): V[];

  /**
   * Filters the array based on the Boolean constructor.
   * @param predicate The `Boolean` constructor is used to filter falsy values.
   * @param thisArg The value to use as `this` when executing the predicate.
   * @returns A new array with elements that are truthy.
   */
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

/**
 * ReadonlyArray extension for the `filter` method, using a custom `BooleanConstructor`.
 */
interface ReadonlyArray<T> extends Array<T> {}
