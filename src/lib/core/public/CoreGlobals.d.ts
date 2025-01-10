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
interface Array<T> {
  aggregate<S>(seed: S, func: (acc: S, item: T) => S): S;
  all(predicate: (item: T) => boolean): boolean;
  any(predicate?: (item: T) => boolean): boolean;
  contains(item: T): boolean;
  countBy(selector?: (item: T) => number): number;
  distinct(): T[];
  except(secondArray: T[]): T[];
  first(predicate?: (item: T) => boolean): T | undefined;
  groupBy<K>(keySelector: (item: T) => K): Map<K, T[]>;
  intersect(secondArray: T[]): T[];
  joins<U, K, V>(
    innerArray: U[],
    outerKeySelector: (outer: T) => K,
    innerKeySelector: (inner: U) => K,
    resultSelector: (outer: T, inner: U) => V,
  ): V[];
  last(predicate?: (item: T) => boolean): T | undefined;
  orderBy(selector: (item: T) => any): T[];
  orderByDescending(selector: (item: T) => any): T[];
  select<S>(selector: (item: T) => S): S[];
  selectMany<U>(selector: (item: T) => U[]): U[];
  skip(count: number): T[];
  skipWhile(predicate: (item: T) => boolean): T[];
  sum(selector?: (item: T) => number): number;
  take(count: number): T[];
  takeWhile(predicate: (item: T) => boolean): T[];
  toArray(): T[];
  union(secondArray: T[]): T[];
  where(predicate: (item: T) => boolean): Array<T>;
  zip<U, V>(secondArray: U[], resultSelector: (first: T, second: U) => V): V[];
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

/**
 * ReadonlyArray extension for the `filter` method, using a custom `BooleanConstructor`.
 */
interface ReadonlyArray<T> extends Array<T> {}
